import JapaneseHolidays from 'japanese-holidays';
import Day from './day.js';

/**
 * Class that represents an issue.
 * Issue has either opened or closed status.
 */
export class Issue {
  /**
   * Creates an issue with `open` day and optional `close` day.
   *
   * @param {Day} open - Day when the issue opened.
   * @param {Day} [close] - Day when the issue closed.
   */
  constructor(open, close) {
    this.open = open;
    this.close = close;
  }

  /**
   * Creates an issue with opened status.
   *
   * @param {Day} open - Day when the issue opened.
   */
  static opened(open) {
    return new Issue(open, null);
  }

  /**
   * Creates an issue with closed status.
   *
   * @param {Day} open - Day when the issue opened.
   * @param {Day} close - Day when the issue closed.
   */
  static closed(open, close) {
    return new Issue(open, close);
  }
}

class CountMap {
  constructor() {
    this.map = new Map();
  }

  get(day) {
    return this.map.get(day.toString()) || CountMap._initVal();
  }

  opened(day) {
    this._incr(day, 'open');
  }

  closed(day) {
    this._incr(day, 'close');
  }

  *days() {
    for (let key of this.map.keys()) {
      yield Day.fromString(key);
    }
  }

  _incr(day, type) {
    let key = day.toString();
    let oc = this.map.get(key);
    if (oc === undefined) {
      oc = CountMap._initVal();
    }
    oc[type]++;
    this.map.set(key, oc);
  }

  static _initVal() {
    return { open: 0, close: 0 };
  }
}

/**
 * Burndown class that generates burndown, burnup data from issues.
 */
export class Burndown {
  /**
   * Creates `Burndown` instance from `issues`.
   *
   * @param {Issue[]} issues - Array of issues.
   * @param {Object} [options] - Burndown options.
   * @param {Day[]} [options.skippedDays] - Array of days to be skipped.
   * @param {boolean} [options.skipWeekend] - Whether to skip Saturday and Sunday.
   * @param {boolean} [options.skipHoliday] - Whether to skip Holidays.
   */
  constructor(issues, options) {
    this.issues = issues;
    this.options = Object.assign({
      skippedDays: [],
      skipWeekend: true,
      skipHoliday: true
    }, options);
    this.firstDay = null;
    this.lastDay = null;
    this.init();
  }

  init() {
    let map = new CountMap();
    for (let issue of this.issues) {
      map.opened(issue.open);
      if (issue.close) {
        map.closed(issue.close);
      }
      if (this.firstDay === null || this.firstDay.isAfter(issue.open)) {
        this.firstDay = issue.open;
      }
      if (this.lastDay === null || this.lastDay.isBefore(issue.open)) {
        this.lastDay = issue.open;
      }
      if (issue.close && this.lastDay.isBefore(issue.close)) {
        this.lastDay = issue.close;
      }
    }
    this.countMap = map;
  }

  /**
   * Calculates burndown and burnup data between the specified days.
   *
   * @param {Day} startDay - Start day of burndown graph.
   * @param {Day} endDay - End day of burndown graph.
   * @param {Day} [dueDay] - Due day of burndown graph.
   * @return {Object} - Object that contains burndown (`downs`), burnup (`ups`),
   *                    total velocity (`velocityClose`) and close only velocity (`velocityClose`)
   *                    If `dueDay` is specified, ideal velocity (`velocityIdeal`) is also returned.
   */
  burndown(startDay, endDay, dueDay) {
    let downs = [];
    let ups   = [];
    let openTotal  = 0;
    let closeTotal = 0;

    for (let day of this.countMap.days()) {
      if (day.isBefore(startDay)) {
        let oc = this.countMap.get(day);
        openTotal  += oc.open;
        closeTotal += oc.close;
      }
    }
    let completedDay = null;
    for (let day of startDay.until(endDay)) {
      let oc = this.countMap.get(day);
      openTotal  += oc.open;
      closeTotal += oc.close;
      if (!this.isDaySkipped(day)) {
        downs.push(openTotal - closeTotal);
        ups.push(closeTotal);
      }
      if (openTotal == closeTotal) {
        if (completedDay == null) {
          completedDay = day.clone();
        }
      } else if (completedDay != null) {
        completedDay = null;
      }
    }
    let totalDays = 0;
    if (completedDay == null) {
      totalDays = downs.length - 1;
    } else {
      for (let day of startDay.until(completedDay)) {
        if (!this.isDaySkipped(day)) {
          totalDays++;
        }
      }
      totalDays--;
    }

    let velocityIdeal = null;
    if (dueDay) {
      let days = 0;
      for (let day of startDay.until(dueDay)) {
        if (!this.isDaySkipped(day)) {
          days++;
        }
        if (days > 0) {
          velocityIdeal = - downs[0] / (days - 1);
        }
      }
    }
    let velocityTotal = (downs[downs.length - 1] - downs[0]) / totalDays;
    let velocityClose = (ups[0] - ups[ups.length - 1]) / totalDays;
    return {
      downs,
      ups,
      velocityTotal,
      velocityClose,
      velocityIdeal,
    };
  }

  /**
   * Returns whether to skip the specified day.
   *
   * @param {Day} day - Day to be checked.
   * @return {boolean} - Whether to skip the day.
   */
  isDaySkipped(day) {
    let dow = day.day();
    if (this.options.skipWeekend && (dow == 0 || dow == 6)) {
      return true;
    }
    if (this.options.skipHoliday && JapaneseHolidays.isHoliday(day.toDate())) {
      return true;
    }
    return this.options.skippedDays.find(d => d.isSame(day));
  }

  /**
   * Returns the first day not after `day` that is not skipped.
   *
   * @param {Day} endDay - Day of origin.
   * @param {Day} startDay - Day of stop.
   * @return {Day} - The first day that is not skipped.
   */
  skipDaysBefore(endDay, startDay) {
    for (let day of endDay.untilBack(startDay)) {
      if (!this.isDaySkipped(day)) {
        return day;
      }
    }
    return startDay;
  }
}

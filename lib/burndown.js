import moment from 'moment';
import Day from './day';

export class Issue {
  constructor(open, close) {
    this.open = open;
    this.close = close;
  }

  static opened(open) {
    return new Issue(open, null);
  }

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

export class Burndown {
  constructor(issues, options) {
    this.issues = issues;
    this.options = Object.assign({
      skippedDays: [],
      skipWeekend: true
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

  burndown(startDay, endDay) {
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
    for (let day of startDay.until(endDay)) {
      let oc = this.countMap.get(day);
      openTotal  += oc.open;
      closeTotal += oc.close;
      if (!this.isDaySkipped(day)) {
        downs.push(openTotal - closeTotal);
        ups.push(closeTotal);
      }
    }
    let velocityTotal = (downs[downs.length - 1] - downs[0]) / (downs.length - 1);
    let velocityClose = (ups[0] - ups[ups.length - 1]) / (ups.length - 1);
    return {
      downs,
      ups,
      velocityTotal,
      velocityClose
    };
  }

  isDaySkipped(day) {
    let dow = day.day();
    if (this.options.skipWeekend && (dow == 0 || dow == 6)) {
      return true;
    }
    return this.options.skippedDays.find(d => d.isSame(day));
  }
}

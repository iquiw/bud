import dayjs from 'dayjs';
import arraySupport from 'dayjs/plugin/arraySupport.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(arraySupport);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

/**
 * Value object that represents a day.
 *
 * It is an immutable wrapper of `dayjs`.
 *
 * The following methods of `dayjs` can be used for `Day` also.
 * If method takes `dayjs` argument, `Day` instance needs to be used
 * instead of `dayjs`.
 *
 *  - day
 *  - isAfter
 *  - isBefore
 *  - isSame
 *  - isSameOrAfter
 *  - isSameOrBefore
 *
 */
export default class Day {
  /**
   * Creates `Day` instance at the specified date.
   *
   * @param {number} year - Year.
   * @param {number} month - Month between 1 and 12.
   * @param {number} date - Day of month.
   */
  constructor(year, month, date) {
    this.dayj = dayjs([year, month - 1, date]);
  }

  /**
   * Clones `Day` instance.
   */
  clone() {
    return Day.fromDayjs(this.dayj.clone());
  }

  /**
   * Generator function that yields days.
   * It starts from this day and continues until it does not pass `endDay`
   * if specified.
   * Otherwise, it continues forever.
   *
   * Note that the same `Day` instance is reused by the generator.
   *
   * @param {Day} [endDay] - Day when the generator ends.
   */
  *until(endDay) {
    for (let dayj = this.dayj;
         !endDay || dayj.isSameOrBefore(endDay.dayj);
         dayj = dayj.add(1, 'days')) {
       yield Day.fromDayjs(dayj);
    }
    return null;
  }

  /**
   * Generator function that yields days.
   * It starts from this day and continues back while it passes `endDay`
   * if specified.
   * Otherwise, it continues forever.
   *
   * Note that the same `Day` instance is reused by the generator.
   *
   * @param {Day} [endDay] - Day when the generator ends.
   */
  *untilBack(endDay) {
    for (let dayj = this.dayj;
         !endDay || dayj.isSameOrAfter(endDay.dayj);
         dayj = dayj.subtract(1, 'days')) {
       yield Day.fromDayjs(dayj);
    }
  }

  day() {
    return this.dayj.day();
  }

  /**
   * Returns Date instance of the day.
   * @return {Date} - Date of the day.
   */
  toDate() {
    return this.dayj.toDate();
  }

  /**
   * Returns formatted string in "YYYY-MM-DD" format.
   */
  toString() {
    return this.dayj.format('YYYY-MM-DD');
  }

  /**
   * Returns formatted string in "M/D" format.
   */
  toShortString() {
    return this.dayj.format('M/D');
  }

  /**
   * Creates `Day` instance from `dayjs` instance.
   * Time part is omitted.
   */
  static fromDayjs(dayj) {
    return new Day(dayj.year(), dayj.month() + 1, dayj.date());
  }

  /**
   * Creates `Day` instance from string in "YYYY-MM-DD" format.
   */
  static fromString(str) {
    return Day.fromDayjs(dayjs(str, 'YYYY-MM-DD'));
  }
}

['isAfter', 'isBefore', 'isSame', 'isSameOrAfter', 'isSameOrBefore'].forEach(method => {
  Day.prototype[method] = function(other) {
    return dayjs.prototype[method].apply(this.dayj, [other.dayj]);
  };
});

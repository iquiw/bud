import moment from 'moment';

/**
 * Value object that represents a day.
 *
 * It is an immutable wrapper of `moment`.
 *
 * The following methods of `moment` can be used for `Day` also.
 * If method takes `moment` argument, `Day` instance needs to be used
 * instead of `moment`.
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
    this.moment = moment([year, month - 1, date]);
  }

  /**
   * Clones `Day` instance.
   */
  clone() {
    return Day.fromMoment(this.moment.clone());
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
    for (let day = this.clone();
         !endDay || day.isSameOrBefore(endDay);
         day.moment.add(1, 'days')) {
      yield day;
    }
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
    for (let day = this.clone();
         !endDay || day.isSameOrAfter(endDay);
         day.moment.subtract(1, 'days')) {
      yield day;
    }
  }

  /**
   * Returns Date instance of the day.
   * @return {Date} - Date of the day.
   */
  toDate() {
    return this.moment.toDate();
  }

  /**
   * Returns formatted string in "YYYY-MM-DD" format.
   */
  toString() {
    return this.moment.format('YYYY-MM-DD');
  }

  /**
   * Returns formatted string in "M/D" format.
   */
  toShortString() {
    return this.moment.format('M/D');
  }

  /**
   * Creates `Day` instance from `moment` instance.
   * Time part is omitted.
   */
  static fromMoment(mmt) {
    return new Day(mmt.year(), mmt.month() + 1, mmt.date());
  }

  /**
   * Creates `Day` instance from string in "YYYY-MM-DD" format.
   */
  static fromString(str) {
    return Day.fromMoment(moment(str, 'YYYY-MM-DD'));
  }
}

['isAfter', 'isBefore', 'isSame', 'isSameOrAfter', 'isSameOrBefore'].forEach(method => {
  Day.prototype[method] = function(other) {
    return moment.prototype[method].apply(this.moment, [other.moment]);
  };
});

['day'].forEach(method => {
  Day.prototype[method] = function() {
    return moment.prototype[method].apply(this.moment);
  };
});

import moment from 'moment';

export default class Day {
  constructor(year, month, day) {
    this.moment = moment([year, month - 1, day]);
  }

  next() {
    return this.clone()._next_self();
  }

  _next_self() {
    this.moment.add(1, 'days');
    return this;
  }

  clone() {
    return Day.fromMoment(this.moment.clone());
  }

  *until(endDay) {
    for (let day = this.clone(); day.isSameOrBefore(endDay); day._next_self()) {
      yield day;
    }
  }

  toString() {
    return this.moment.format('YYYY-MM-DD');
  }

  toShortString() {
    return this.moment.format('M/D');
  }

  static fromMoment(mmt) {
    return new Day(mmt.year(), mmt.month() + 1, mmt.date());
  }

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

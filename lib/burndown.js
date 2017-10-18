import moment from 'moment';

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

  get(key) {
    return this.map.get(this._normalize(key)) || CountMap._initVal();
  }

  opened(key) {
    this._incr(key, 'open');
  }

  closed(key) {
    this._incr(key, 'close');
  }

  *days() {
    for (let key of this.map.keys()) {
      yield moment(key, 'YYYY-MM-DD');
    }
  }

  _incr(key, type) {
    key = this._normalize(key);
    let oc = this.map.get(key);
    if (oc === undefined) {
      oc = CountMap._initVal();
    }
    oc[type]++;
    this.map.set(key, oc);
  }

  _normalize(key) {
    return key.format('YYYY-MM-DD');
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
    this.firstDate = null;
    this.lastDate = null;
    this.init();
  }

  init() {
    let map = new CountMap();
    for (let issue of this.issues) {
      map.opened(issue.open);
      if (issue.close) {
        map.closed(issue.close);
      }
      if (this.firstDate === null || this.firstDate.isAfter(issue.open)) {
        this.firstDate = issue.open;
      }
      if (this.lastDate === null || this.lastDate.isBefore(issue.open)) {
        this.lastDate = issue.open;
      }
      if (issue.close && this.lastDate.isBefore(issue.close)) {
        this.lastDate = issue.close;
      }
    }
    this.countMap = map;
  }

  burndown(startDate, endDate) {
    let downs = [];
    let ups   = [];
    let openTotal  = 0;
    let closeTotal = 0;

    for (let date of this.countMap.days()) {
      if (date.isBefore(startDate)) {
        let oc = this.countMap.get(date);
        openTotal  += oc.open;
        closeTotal += oc.close;
      }
    }
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'days')) {
      let oc = this.countMap.get(date);
      openTotal  += oc.open;
      closeTotal += oc.close;
      if (!this.isDateSkipped(date)) {
        downs.push(openTotal - closeTotal);
        ups.push(closeTotal);
      }
    }
    return { downs, ups };
  }

  isDateSkipped(date) {
    let dow = date.day();
    if (this.options.skipWeekend && (dow == 0 || dow == 6)) {
      return true;
    }
    return this.options.skippedDays.find(d => d.isSame(date));
  }
}

class Issue {
  constructor(open, close) {
    this.open = open;
    this.close = close;
  }

  static opened(open) {
    return new Issue(open, null);
  }

  static closed = Issue;
}

class CountMap {
  constructor() {
    this.map = new Map();
  }

  get(key) {
    return this.map(key) || CountMap._initVal();
  }

  opened(key) {
    this._incr(key, 'open');
  }

  closed(key) {
    this._incr(key, 'close');
  }

  _incr(key, type) {
    let oc = this.map.get(key);
    if (oc === undefined) {
      oc = CountMap._initVal();
    }
    oc[type]++;
    this.map.set(key, oc);
  }

  static _initVal() {
    return { open: 0, close: 0};
  }
}

class Burndown {
  constructor(issues) {
    this.issues = issues;
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
      if (this.firstDate === null || this.firstDate.after(issue.open)) {
        this.firstDate = issue.open;
      }
      if (this.lastDate === null || this.lastDate.before(issue.open)) {
        this.lastDate = issue.open;
      }
      if (issue.close && this.lastDate.before(issue.close)) {
        this.lastDate = issue.close;
      }
    }
    this.countMap = map;
  }

  burndown(startDate, endDate) {
    let result     = [];
    let openTotal  = 0;
    let closeTotal = 0;

    for (let date = startDate; date.before(endDate); date.add(1)) {
      let oc = this.countMap.get(date);
      openTotal  += oc.open;
      closeTotal += oc.close;
      result.push(openTotal - closeTotal);
    }
    return result;
  }
}

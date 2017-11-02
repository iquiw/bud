import moment from 'moment';

import { Burndown, Issue } from './lib/burndown';
import DayChart from './lib/daychart';

function day(y, m, d) {
  return moment([y, m - 1, d]);
}

let issues = [
  Issue.opened(day(2017, 8, 10)),
  Issue.closed(day(2017, 8, 11), day(2017, 8, 11)),
  Issue.closed(day(2017, 8, 11), day(2017, 8, 14)),
  Issue.closed(day(2017, 8, 11), day(2017, 8, 16)),
  Issue.opened(day(2017, 8, 12)),
  Issue.closed(day(2017, 8, 12), day(2017, 8, 15)),
  Issue.closed(day(2017, 8, 14), day(2017, 8, 14)),
  Issue.closed(day(2017, 8, 15), day(2017, 8, 15))
];

let burndown = new Burndown(issues);

let dc = new DayChart(document.getElementById('myChart').getContext('2d'));
dc.draw(day(2017, 8, 12), day(2017, 8, 18), burndown);

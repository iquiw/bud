import moment from 'moment';

import { Burndown, Issue } from './lib/burndown';
import DayChart from './lib/daychart';

let issues = [
  Issue.opened(moment([2017, 7, 10])),
  Issue.opened(moment([2017, 7, 12])),
  Issue.closed(moment([2017, 7, 14]), moment([2017, 7, 14])),
  Issue.closed(moment([2017, 7, 11]), moment([2017, 7, 14]))
];

let burndown = new Burndown(issues);

let dc = new DayChart(document.getElementById('myChart').getContext('2d'));
dc.draw(moment([2017, 7, 10]), moment([2017, 7, 18]), burndown);

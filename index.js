import moment from 'moment';

import { Burndown, Issue } from './lib/burndown';
import DayChart from './lib/daychart';
import { issues, firstDate, lastDate } from './issues';

let burndown = new Burndown(issues);

let dc = new DayChart(document.getElementById('myChart').getContext('2d'));
dc.draw(firstDate, lastDate, burndown);

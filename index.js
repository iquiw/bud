import moment from 'moment';

import { Burndown } from './lib/burndown';
import DayChart from './lib/daychart';
import Day from './lib/day';
import { issues, firstDate, lastDate, endDate } from './issues';

let burndown = new Burndown(issues);

let dc = new DayChart(document.getElementById('myChart').getContext('2d'));
dc.draw(firstDate, lastDate, endDate, burndown);

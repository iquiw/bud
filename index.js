import moment from 'moment';

import { Burndown } from './lib/burndown';
import DayChart from './lib/daychart';
import Day from './lib/day';
import { issues, startDay, endDay, dueDay } from './issues';

let burndown = new Burndown(issues);

let dc = new DayChart(document.getElementById('myChart').getContext('2d'));
dc.draw(startDay, endDay, dueDay, burndown);

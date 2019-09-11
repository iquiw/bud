import moment from 'moment';

import { Burndown, Issue } from './lib/burndown';
import DayChart from './lib/daychart';
import Day from './lib/day';

export function drawDayChart(vis) {
  let burndown = new Burndown(
    vis.issues.map((issue) => new Issue(Day.fromString(issue.open),
                                        issue.close ? Day.fromString(issue.close) : null)));

  let dc = new DayChart(document.getElementById('myChart').getContext('2d'), {
    title: {
      display: true,
      position: 'bottom',
      text: vis.version,
    },
    showEstimate: true
  });
  dc.draw(
    Day.fromString(vis.startDate),
    Day.fromString(vis.endDate),
    Day.fromString(vis.dueDate),
    burndown
  );
}

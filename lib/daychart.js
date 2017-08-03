import moment from 'moment';
import Chart from 'chart.js';
import { Burndown, Issue } from './burndown';

export default class DayChart {
  constructor(ctx, start, end) {
    this.ctx = ctx;
  }
  draw(startDate, endDate) {
    let labels = [];
    for (let date = startDate; date.isSameOrBefore(endDate); date.add(1, 'days')) {
      labels.push(date.format('M/D'));
    }
    let issues = [
      Issue.opened(moment([2017, 6, 10])),
      Issue.opened(moment([2017, 6, 12])),
      Issue.closed(moment([2017, 6, 14]), moment([2017, 6, 14])),
      Issue.closed(moment([2017, 6, 11]), moment([2017, 6, 14]))
    ];

    let burndown = new Burndown(issues);
    let result = burndown.burndown(moment([2017, 6, 10]), moment([2017, 6, 18]));
    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Burndown',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: result
        }]
      },
      options: {
        scales: {
          xAxes: [{
            stacked: true
          }],
          yAxes: [{
            stacked: true
          }]
        }
      }
    });
  }
}

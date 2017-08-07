import moment from 'moment';
import Chart from 'chart.js';

export default class DayChart {
  constructor(ctx) {
    this.ctx = ctx;
  }

  draw(startDate, endDate, burndown) {
    let labels = [];
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'days')) {
      labels.push(date.format('M/D'));
    }

    let result = burndown.burndown(startDate, endDate);
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
            stacked: true,
            ticks: {
              stepSize: 1
            }
          }]
        }
      }
    });
  }
}

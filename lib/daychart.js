import moment from 'moment';
import Chart from 'chart.js';

export default class DayChart {
  constructor(ctx, options) {
    Object.assign(this, {
      ctx: ctx,
      color1: 'rgb(255, 99, 132)',
      color2: 'rgb(54, 162, 235)'
    }, options);
  }

  draw(startDate, endDate, burndown) {
    let days = [];
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'days')) {
      if (!burndown.isDateSkipped(date)) {
        days.push(date.format('M/D'));
      }
    }

    let { downs, ups } = burndown.burndown(startDate, endDate);
    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Burndown',
          backgroundColor: Chart.helpers.color(this.color1).alpha(0.5).rgbString(),
          borderColor: this.color1,
          borderWidth: 1,
          data: downs
        }, {
          label: 'Burnup',
          backgroundColor: Chart.helpers.color(this.color2).alpha(0.5).rgbString(),
          borderColor: this.color2,
          borderWidth: 1,
          data: ups
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

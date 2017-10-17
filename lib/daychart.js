import moment from 'moment';
import Chart from 'chart.js';

export default class DayChart {
  constructor(ctx, options) {
    Object.assign(this, {
      ctx: ctx,
      colorOpen: 'rgb(255, 99, 132)',
      colorClosed: 'rgba(75, 192, 192)'
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
          label: 'Open',
          backgroundColor: Chart.helpers.color(this.colorOpen).alpha(0.5).rgbString(),
          borderColor: this.colorOpen,
          borderWidth: 1,
          data: downs
        }, {
          label: 'Closed',
          backgroundColor: Chart.helpers.color(this.colorClosed).alpha(0.5).rgbString(),
          borderColor: this.colorClosed,
          borderWidth: 1,
          data: ups
        }]
      },
      options: {
        title: this.title,
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

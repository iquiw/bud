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
    let { downs, ups, velocity } = burndown.burndown(startDate, endDate);
    let estimates = [];
    for (let i = 0, x = downs[0], date = startDate.clone();
         x >= 0;
         date.add(1, 'days')) {
      if (!burndown.isDateSkipped(date)) {
        days.push(date.format('M/D'));
        estimates.push(x);
        x = velocity * ++i + downs[0];
      }
    }

    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Open',
          backgroundColor: DayChart.fade(this.colorOpen),
          borderColor: this.colorOpen,
          borderWidth: 1,
          data: downs
        }, {
          label: 'Closed',
          backgroundColor: DayChart.fade(this.colorClosed),
          borderColor: this.colorClosed,
          borderWidth: 1,
          data: ups
        }, {
          label:'Estimate',
          type: 'line',
          data: estimates
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
  static fade(color) {
    return Chart.helpers.color(color).alpha(0.5).rgbString();
  }
}

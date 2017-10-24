import moment from 'moment';
import Chart from 'chart.js';

export default class DayChart {
  constructor(ctx, options) {
    Object.assign(this, {
      ctx: ctx,
      colorOpen: 'rgb(255, 99, 132)',
      colorClosed: 'rgb(75, 192, 192)',
      colorEstimate: 'rgb(54, 162, 235)',
      colorOptimistic: 'rgb(255, 205, 86)',
      showEstimate: true
    }, options);
  }

  draw(startDate, endDate, burndown) {
    let max = 0;
    let days = [];
    let { downs, ups, velocityTotal, velocityClose } = burndown.burndown(startDate, endDate);
    let estimates = [];
    let optimates = [];
    for (let i = 0, estimate = downs[0], optimate = null, date = startDate.clone();
         estimate >= 0 && (this.showEstimate || date.isSameOrBefore(endDate));
         date.add(1, 'days')) {
      if (burndown.isDateSkipped(date)) {
        continue;
      }
      days.push(date.format('M/D'));
      estimates.push(estimate);
      if (date.isSame(endDate)) {
        optimate = downs[i];
      } else if (date.isAfter(endDate)) {
        optimate += velocityClose;
      }
      if (optimate === null) {
        optimates.push(optimate);
      } else if (optimate >= 0) {
        optimates.push(optimate);
      }
      estimate += velocityTotal;
      let curr = downs[i] + ups[i];
      if (curr > max) {
        max = curr;
      }
      i++;
    }
    let datasets = [{
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
    }];
    if (this.showEstimate) {
      datasets.push({
        label:'Estimate',
        backgroundColor: DayChart.fade(this.colorEstimate),
        borderColor: this.colorEstimate,
        fill: false,
        type: 'line',
        data: estimates,
        yAxisID: 'line'
      });
      datasets.push({
        label:'Optimistic',
        backgroundColor: DayChart.fade(this.colorOptimistic),
        borderColor: this.colorOptimistic,
        type: 'line',
        fill: false,
        data: optimates,
        yAxisID: 'line'
      });
    }

    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: datasets
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
          }, {
            id: 'line',
            stacked: false,
            ticks: {
              display: false,
              max: max,
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

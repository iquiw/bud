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

  draw(startDay, endDay, burndown) {
    let days = [];
    let { downs, ups, velocityTotal, velocityClose } = burndown.burndown(startDay, endDay);
    let estimates = [downs[0]];
    let optimates = [];
    let dayGenerator = startDay.until();
    for (let i = 0, estimate = downs[0], optimate = null, day = dayGenerator.next().value;
         (this.showEstimate
          && (velocityTotal < 0 && estimate >= 0 || velocityClose < 0 && optimate >= 0))
         || day.isSameOrBefore(endDay);
         day = dayGenerator.next().value) {
      if (burndown.isDaySkipped(day)) {
        continue;
      }
      days.push(day.toShortString());
      if (day.isSame(endDay)) {
        optimate = downs[i];
      } else if (day.isAfter(endDay)) {
        optimate += velocityClose;
      }
      if (optimate === null) {
        optimates.push(optimate);
      } else if (optimate > 0 || optimate <= 0 && optimates[optimates.length - 1] > 0) {
        optimates.push(optimate);
      }
      estimate += velocityTotal;
      estimates.push(estimate);
      let curr = downs[i] + ups[i];
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
            id: 'bar',
            stacked: true,
            ticks: {
              min: 0,
              stepSize: 1
            },
            beforeBuildTicks: (axis) => {
              if (DayChart.isBarHidden(axis.chart)) {
                axis.options.ticks.display = false;
              } else {
                axis.options.ticks.display = true;
              }
            }
          }, {
            id: 'line',
            stacked: false,
            ticks: {
              min: 0,
              stepSize: 1
            },
            beforeBuildTicks: (axis) => {
              if (DayChart.isBarHidden(axis.chart)) {
                axis.max = estimates[0];
                axis.options.ticks.display = true;
              } else {
                axis.max = axis.chart.scales['bar'].max;
                axis.options.ticks.display = false;
              }
            }
          }]
        }
      }
    });
  }

  static isBarHidden(chart) {
    let meta0 = chart.getDatasetMeta(0);
    let meta1 = chart.getDatasetMeta(1);
    return (meta0.hidden && meta1.hidden);
  }

  static fade(color) {
    return Chart.helpers.color(color).alpha(0.5).rgbString();
  }
}

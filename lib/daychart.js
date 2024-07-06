import Chart from 'chart.js/auto';
import { color } from 'chart.js/helpers';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

/**
 * Daily Burndown chart class.
 */
export default class DayChart {
  /**
   * Creates `DayChart` instance on the specified context.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context.
   * @param {Object} [options] - Chart options.
   * @param {string} [options.colorOpen] - Color string of burndown graph.
   * @param {string} [options.colorClose] - Color string of burnup graph.
   * @param {string} [options.colorEstimate] - Color string of estimation graph.
   * @param {string} [options.colorOptimistic] - Color string of optimistic estimation graph.
   * @param {string} [options.colorIdeal] - Color string of ideal line graph.
   * @param {string} [options.legendOpen] - Legend string of burndown graph.
   * @param {string} [options.legendClose] - Legend string of burnup graph.
   * @param {boolean} [options.showEstimate] - Whether to show estimation graphs.
   * @param {boolean} [options.showIdeal] - Whether to show ideal line graph.
   * @param {boolean} [options.showLabel] - Whether to show label.
   * @param {number} [options.stepSize] - Step size of y-axis of graph (default 5).
   */
  constructor(ctx, options) {
    Object.assign(this, {
      ctx: ctx,
      colorOpen: 'rgb(255, 99, 132)',
      colorClosed: 'rgb(75, 192, 192)',
      colorEstimate: 'rgb(54, 162, 235)',
      colorOptimistic: 'rgb(255, 205, 86)',
      colorIdeal: 'rgb(132, 235, 86)',
      legendOpen: 'Open',
      legendClose: 'Close',
      showEstimate: true,
      showIdeal: true,
      showLabel: true,
      stepSize: 5,
    }, options);
  }

  /**
   * Draws daily burndown graphs in the specified day range.
   *
   * @param {Day} startDay - Start day of burndown graph.
   * @param {Day} endDay - End day of burndown graph.
   * @param {Day} dueDay - End day of x-axis of burndown graph.
   * @param {Burndown} burndown - Burndown graph data.
   */
  draw(startDay, endDay, dueDay, burndown) {
    let days = [];
    let {
      downs, ups,
      velocityTotal, velocityClose, velocityIdeal
    } = burndown.burndown(startDay, endDay, dueDay);
    endDay = burndown.skipDaysBefore(endDay);

    let estimates = [downs[0]];
    let optimates = [];
    let ideals = [downs[0]];
    let dayGenerator = startDay.until();
    for (let i = 0, estimate = downs[0], optimate = null, ideal = downs[0],
             day = dayGenerator.next().value;
         day.isSameOrBefore(dueDay);
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
      if (velocityIdeal) {
        ideal += velocityIdeal;
        ideals.push(ideal);
      }
      i++;
    }
    let datasets = [{
      label: this.legendOpen,
      backgroundColor: DayChart.fade(this.colorOpen),
      borderColor: this.colorOpen,
      borderWidth: 1,
      data: downs,
      datalabels: { display: this.showLabel },
      yAxisID: 'bar',
    }, {
      label: this.legendClose,
      backgroundColor: DayChart.fade(this.colorClosed),
      borderColor: this.colorClosed,
      borderWidth: 1,
      data: ups,
      datalabels: { display: this.showLabel },
      yAxisID: 'bar',
    }];
    if (this.showEstimate) {
      datasets.push(DayChart.lineDataset('Estimate', this.colorEstimate, estimates));
      datasets.push(DayChart.lineDataset('Optimistic', this.colorOptimistic, optimates));
    }
    if (this.showIdeal) {
      datasets.push(DayChart.lineDataset('Ideal', this.colorIdeal, ideals));
    }
    this.chart = new Chart(this.ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: datasets
      },
      options: {
        title: this.title,
        plugins: {
          datalabels: {
            font: { size: 16 }
          }
        },
        scales: {
          x: {
            stacked: true
          },
          bar: {
            type: 'linear',
            stacked: true,
            ticks: {
              min: 0,
              stepSize: this.stepSize
            },
            display: 'auto'
          },
          line: {
            type: 'linear',
            stacked: false,
            ticks: {
              min: 0,
              stepSize: 1
            },
            position: 'right',
            beforeBuildTicks: (axis) => {
              if (DayChart.isBarHidden(axis.chart)) {
                axis.max = estimates[0];
                axis.options.ticks.display = true;
              } else {
                axis.max = axis.chart.scales['bar'].max;
                axis.options.ticks.display = false;
              }
            }
          }
        },
        tooltips: {
          callbacks: { label: DayChart.roundTooltipLabel }
        }
      }
    });
  }

  static isBarHidden(chart) {
    let meta0 = chart.getDatasetMeta(0);
    let meta1 = chart.getDatasetMeta(1);
    return (meta0.hidden && meta1.hidden);
  }

  static fade(c) {
    return color(c).alpha(0.5).rgbString();
  }

  static lineDataset(label, color, data) {
      return {
        label: label,
        backgroundColor: DayChart.fade(color),
        borderColor: color,
        type: 'line',
        fill: false,
        tension: 0,
        data: data,
        datalabels: { display: false },
        yAxisID: 'line'
      };
  }

  static roundTooltipLabel(tooltipItem, data) {
    let label = data.datasets[tooltipItem.datasetIndex].label || '';

    if (label) {
      label += ': ';
    }
    label += Math.round(tooltipItem.yLabel * 10) / 10;
    return label;
  }
}

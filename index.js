import moment from 'moment';
import DayChart from './lib/daychart';

let dc = new DayChart(document.getElementById('myChart').getContext('2d'));
dc.draw(moment([2017, 7, 10]), moment([2017, 7, 18]));

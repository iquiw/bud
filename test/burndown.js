import test from 'ava';

import moment from 'moment';
import Day from '../lib/day';
import { Burndown, Issue } from '../lib/burndown';

function day(y, m, d) {
  return new Day(y, m, d);
}

/*
 *       10月 2017
 * 日 月 火 水 木 金 土
 * 29 30 31
 *       11月 2017
 *           1  2  3  4
 *  5  6  7  8  9 10 11
 */
test('Burndown', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 3)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues);
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [3, 2, 3, 4, 3, 2, 2, 2, 2, 2]);
  t.deepEqual(ups, [0, 1, 1, 1, 2, 3, 3, 3, 3, 3]);
  t.is(velocityTotal, - 1 / 9);
  t.is(velocityClose, - 3 / 9);
});

test('All open', t => {
  let issues = [
    Issue.opened(day(2017, 10, 29)),
    Issue.opened(day(2017, 10, 30)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues);
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 2));

  t.deepEqual(downs, [2, 2, 3, 4]);
  t.deepEqual(ups, [0, 0, 0, 0]);
  t.is(velocityTotal, 2 / 3);
  t.is(velocityClose, 0);
});

test('All closed', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 2)),
    Issue.closed(day(2017, 11,  1), day(2017, 11, 6)),
    Issue.closed(day(2017, 11,  2), day(2017, 11, 3)),
  ];
  let burndown = new Burndown(issues);
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 6));

  t.deepEqual(downs, [2, 1, 2, 2, 1, 0]);
  t.deepEqual(ups, [0, 1, 1, 2, 3, 4]);
  t.is(velocityTotal, - 2 / 5);
  t.is(velocityClose, - 4 / 5);
});

test('Disable skipWeekend option', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues, { skipWeekend: false });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [2, 1, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2]);
  t.deepEqual(ups, [0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
  t.is(velocityTotal, 0);
  t.is(velocityClose, - 2 / 11);
});

test('Specify skippedDays option', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues, {
    skippedDays: [day(2017, 10, 31), day(2017, 11, 6)]
  });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [2, 2, 3, 3, 2, 2, 2, 2]);
  t.deepEqual(ups, [0, 1, 1, 1, 2, 2, 2, 2]);
  t.is(velocityTotal, 0);
  t.is(velocityClose, - 2 / 7);
});

test('Specify skippedDays option with skipWeekend disabled', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues, {
    skipWeekend: false,
    skippedDays: [day(2017, 10, 31), day(2017, 11, 3), day(2017, 11, 6)]
  });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [2, 2, 3, 3, 3, 2, 2, 2, 2]);
  t.deepEqual(ups, [0, 1, 1, 1, 1, 2, 2, 2, 2]);
  t.is(velocityTotal, 0);
  t.is(velocityClose, - 2 / 8);
});

import test from 'ava';

import Day from '../lib/day.js';
import { Burndown, Issue } from '../lib/burndown.js';

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
  let burndown = new Burndown(issues, { skipHoliday: false });
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
  let burndown = new Burndown(issues, { skipHoliday: false });
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
  let burndown = new Burndown(issues, { skipHoliday: false });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 6));

  t.deepEqual(downs, [2, 1, 2, 2, 1, 0]);
  t.deepEqual(ups, [0, 1, 1, 2, 3, 4]);
  t.is(velocityTotal, - 2 / 5);
  t.is(velocityClose, - 4 / 5);
});

test('All closed before end date', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 3)),
    Issue.closed(day(2017, 11,  1), day(2017, 11, 3)),
    Issue.closed(day(2017, 11,  2), day(2017, 11, 3)),
  ];
  let burndown = new Burndown(issues, { skipHoliday: false });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [3, 2, 3, 4, 1, 0, 0, 0, 0, 0]);
  t.deepEqual(ups,   [0, 1, 1, 1, 4, 5, 5, 5, 5, 5]);
  t.is(velocityTotal, - 3 / 5);
  t.is(velocityClose, - 5 / 5);
});

test('Disable skipWeekend option', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues, { skipWeekend: false, skipHoliday: false });
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
    skipHoliday: false,
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
    skipHoliday: false,
    skippedDays: [day(2017, 10, 31), day(2017, 11, 3), day(2017, 11, 6)]
  });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [2, 2, 3, 3, 3, 2, 2, 2, 2]);
  t.deepEqual(ups, [0, 1, 1, 1, 1, 2, 2, 2, 2]);
  t.is(velocityTotal, 0);
  t.is(velocityClose, - 2 / 8);
});

/*
 *        9月 2019
 * 15 16 17 18 19 20 21
 *    ^
 * 22 23 24 25 26 27 28
 *    ^
 */
test('Holidays skipped by skipHoliday', t => {
  let issues = [
    Issue.closed(day(2019, 9, 15), day(2019, 9, 15)),
    Issue.closed(day(2019, 9, 15), day(2019, 9, 18)),
    Issue.opened(day(2019, 9, 16)),
    Issue.opened(day(2019, 9, 17)),
  ];
  let burndown = new Burndown(issues, {
    skipWeekend: false
  });
  let { downs, ups, velocityTotal, velocityClose }
      = burndown.burndown(day(2019, 9, 15), day(2019, 9, 18));

  t.deepEqual(downs, [1, 3, 2]);
  t.deepEqual(ups, [1, 1, 2]);
  t.is(velocityTotal, 1 / 2);
  t.is(velocityClose, - 1 / 2);
});

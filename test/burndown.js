import test from 'ava';

import moment from 'moment';
import { Burndown, Issue } from '../lib/burndown';

function day(y, m, d) {
  return moment([y, m - 1, d]);
}

test('Burndown', t => {
  let issues = [
    Issue.closed(day(2017, 10, 29), day(2017, 10, 31)),
    Issue.closed(day(2017, 10, 30), day(2017, 11, 6)),
    Issue.opened(day(2017, 11,  1)),
    Issue.opened(day(2017, 11,  2)),
  ];
  let burndown = new Burndown(issues);
  let { downs, ups } = burndown.burndown(day(2017, 10, 30), day(2017, 11, 10));

  t.deepEqual(downs, [2, 1, 2, 3, 3, 2, 2, 2, 2, 2]);
  t.deepEqual(ups, [0, 1, 1, 1, 1, 2, 2, 2, 2, 2]);
});

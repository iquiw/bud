import test from 'ava';

import Day from '../lib/day';

test('toDate() returns Date instance of the day', t => {
  const day = new Day(2019, 9, 11);
  const date = day.toDate();

  t.is(date.constructor.name, 'Date');
  t.is(date.getFullYear(), 2019);
  t.is(date.getMonth(), 8);
  t.is(date.getDate(), 11);
});

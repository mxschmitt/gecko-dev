// |reftest| skip-if(!this.hasOwnProperty('Temporal')) -- Temporal is not enabled unconditionally
// Copyright (C) 2022 Igalia, S.L. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-temporal.plainyearmonth.prototype.since
description: A number is invalid in place of an ISO string for Temporal.PlainYearMonth
features: [Temporal]
---*/

const instance = new Temporal.PlainYearMonth(2019, 6);

const numbers = [
  1,
  201906,
  -201906,
  1234567,
];

for (const arg of numbers) {
  assert.throws(
    TypeError,
    () => instance.since(arg),
    "A number is not a valid ISO string for PlainYearMonth"
  );
}

reportCompare(0, 0);

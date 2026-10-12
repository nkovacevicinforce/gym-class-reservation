"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const app = require("../src/app.js");

function choose(state, classId, sessionId, count) {
  app.selectClass(state, classId);
  app.selectSession(state, sessionId);
  app.selectParticipants(state, count);
}

test("catalog matches all BRD prices and initial places", () => {
  assert.deepEqual(app.CLASS_CATALOG.map(item => [item.name, item.price]), [
    ["Yoga", 8], ["Pilates", 10], ["Functional Training", 12], ["Spinning", 11]
  ]);
  assert.deepEqual(Object.values(app.createInitialState().remaining),
    [10, 6, 2, 8, 4, 0, 5, 10, 3, 7, 1, 10]);
});

test("one participant uses the final place and cannot be confirmed twice", () => {
  const state = app.createInitialState();
  choose(state, "spinning", "spinning-thu", 1);
  assert.equal(app.confirmReservation(state), true);
  assert.equal(state.reservation.total, 11);
  assert.equal(state.remaining["spinning-thu"], 0);
  assert.equal(app.confirmReservation(state), false);
  assert.equal(state.remaining["spinning-thu"], 0);
});

test("exact remaining availability and the ten-place maximum are accepted", () => {
  for (const [sessionId, count] of [["yoga-wed", 6], ["yoga-mon", 10]]) {
    const state = app.createInitialState();
    choose(state, "yoga", sessionId, count);
    assert.equal(app.confirmReservation(state), true);
    assert.equal(state.reservation.total, count * 8);
    assert.equal(state.remaining[sessionId], 0);
  }
});

test("incomplete, invalid, over-capacity and full bookings never deduct places", () => {
  const state = app.createInitialState();
  const original = { ...state.remaining };
  assert.equal(app.confirmReservation(state), false);
  for (const count of [null, "", "2", "invalid", NaN, Infinity, 0, -1, 1.5, 3, 11]) {
    choose(state, "yoga", "yoga-sat", count);
    assert.equal(app.confirmReservation(state), false);
    assert.deepEqual(state.remaining, original);
    assert.equal(state.reservation, null);
  }
  choose(state, "pilates", "pilates-sat", 1);
  assert.equal(app.confirmReservation(state), false);
  choose(state, "yoga", "pilates-tue", 1);
  assert.equal(app.confirmReservation(state), false);
  choose(state, "unknown", "yoga-mon", 1);
  assert.equal(app.confirmReservation(state), false);
  choose(state, "yoga", "", 1);
  assert.equal(app.confirmReservation(state), false);
  assert.deepEqual(state.remaining, original);
});

test("editing clears dependent selections without changing availability", () => {
  const state = app.createInitialState();
  const original = { ...state.remaining };
  choose(state, "yoga", "yoga-mon", 3);
  assert.equal(app.calculateTotal(state), 24);
  app.selectSession(state, "yoga-wed");
  assert.equal(state.draft.participants, null);
  app.selectClass(state, "pilates");
  assert.deepEqual(state.draft, { classId: "pilates", sessionId: "", participants: null });
  app.selectSession(state, "pilates-thu");
  app.selectParticipants(state, 3);
  assert.equal(app.calculateTotal(state), 30);
  assert.deepEqual(state.remaining, original);
});

test("new reservations retain deductions and fresh initialization restores baseline", () => {
  const state = app.createInitialState();
  choose(state, "yoga", "yoga-wed", 2);
  app.confirmReservation(state);
  assert.equal(state.remaining["yoga-wed"], 4);
  app.startNewReservation(state);
  assert.equal(state.reservation, null);
  assert.equal(state.draft.classId, "");
  choose(state, "yoga", "yoga-wed", 3);
  assert.equal(app.confirmReservation(state), true);
  assert.equal(state.remaining["yoga-wed"], 1);
  assert.equal(state.remaining["pilates-tue"], 8);
  assert.equal(app.createInitialState().remaining["yoga-wed"], 6);
});

test("confirmation rechecks availability and preserves the confirmed snapshot", () => {
  const state = app.createInitialState();
  choose(state, "yoga", "yoga-wed", 6);
  state.remaining["yoga-wed"] = 4;
  assert.equal(app.confirmReservation(state), false);
  app.selectParticipants(state, 2);
  assert.equal(app.confirmReservation(state), true);
  assert.deepEqual(state.reservation, {
    className: "Yoga", sessionLabel: "Wednesday 19:00", participants: 2, price: 8, total: 16
  });
  app.selectClass(state, "pilates");
  assert.equal(state.draft.classId, "yoga");
});
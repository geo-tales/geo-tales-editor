/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var events = require('events');
var locatify = require('locatify');
var editScreen = require('../lib/edit-screen');


describe('edit-screen navigate', function () {
  var div;
  var editor;
  var tracker;

  beforeEach(function () {
    tracker = new events.EventEmitter();
    tracker.destroy = sinon.spy();
    sinon.stub(locatify, 'create').returns(tracker);
    div = document.createElement('div');
    editor = editScreen.create(div, {
      type: 'navigate'
    });
  });

  afterEach(function () {
    locatify.create.restore();
  });

  function selectType(type) {
    var typeSelect = div.querySelector('select[name=type]');
    typeSelect.value = type;
    typeSelect.onchange();
  }

  function toggleTracker() {
    var el = div.querySelector('input[name=toggle-tracker]');
    el.click();
    return el;
  }

  it('does not creates location tracker on create', function () {
    sinon.assert.notCalled(locatify.create);
  });

  it('creates location tracker on button click', function () {
    var el = toggleTracker();

    sinon.assert.calledOnce(locatify.create);
    assert.equal(el.value, 'Hide current location');
    assert.equal(div.querySelector('.current-latitude').classList
                 .contains('hidden'), false);
    assert.equal(div.querySelector('.current-longitude').classList
                 .contains('hidden'), false);
    assert.equal(div.querySelector('.current-accuracy').classList
                 .contains('hidden'), false);
  });

  it('destroys location tracker when toggle is clicked again', function () {
    toggleTracker();
    var el = toggleTracker();

    sinon.assert.calledOnce(tracker.destroy);
    assert.equal(el.value, 'Show current location');
    assert.equal(div.querySelector('.current-latitude').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.current-longitude').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.current-accuracy').classList
                 .contains('hidden'), true);
  });

  it('destroys location tracker on screen switch', function () {
    toggleTracker();

    selectType('text');

    sinon.assert.calledOnce(tracker.destroy);
  });

  it('does not destroy location tracker twice in type change', function () {
    toggleTracker();

    selectType('text');
    selectType('answer');

    sinon.assert.calledOnce(tracker.destroy);
  });

  it('does not destroy location tracker twice on toggle click', function () {
    toggleTracker();

    toggleTracker();
    selectType('text');

    sinon.assert.calledOnce(tracker.destroy);
  });

  it('does not show current location when twiching screen type', function () {
    var el = toggleTracker();
    selectType('text');
    selectType('navigate');

    assert.equal(el.value, 'Show current location');
    assert.equal(div.querySelector('.current-latitude').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.current-longitude').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.current-accuracy').classList
                 .contains('hidden'), true);
  });

  it('shows current position from tracker', function () {
    toggleTracker();

    tracker.emit('position', {
      latitude: '6.7890',
      longitude: '1.2345',
      accuracy: 5
    });

    assert.equal(div.querySelector('.current-latitude').innerHTML, '6.7890');
    assert.equal(div.querySelector('.current-longitude').innerHTML, '1.2345');
    assert.equal(div.querySelector('.current-accuracy').innerHTML, '5');
  });

});
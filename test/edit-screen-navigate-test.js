/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var events = require('events');
var locatify = require('locatify');
var editScreen = require('../lib/edit-screen');


describe('edit-screen navigate', function () {
  var div;
  var tracker;

  beforeEach(function () {
    tracker = new events.EventEmitter();
    tracker.destroy = sinon.spy();
    sinon.stub(locatify, 'create').returns(tracker);
    div = document.createElement('div');
  });

  afterEach(function () {
    locatify.create.restore();
  });

  function create(config) {
    config = config || {};
    config.type = 'navigate';
    editScreen.create(div, config);
  }

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

  function isHidden(query) {
    return div.querySelector(query).classList.contains('hidden');
  }

  it('does not creates location tracker on create', function () {
    create();

    sinon.assert.notCalled(locatify.create);
  });

  it('creates location tracker on button click', function () {
    create();

    var el = toggleTracker();

    sinon.assert.calledOnce(locatify.create);
    assert.equal(el.value, 'Hide current location');
    assert.equal(isHidden('.current-latitude'), false);
    assert.equal(isHidden('.current-longitude'), false);
    assert.equal(isHidden('.current-accuracy'), false);
    assert.equal(isHidden('.use-location'), false);
  });

  it('destroys location tracker when toggle is clicked again', function () {
    create();

    toggleTracker();
    var el = toggleTracker();

    sinon.assert.calledOnce(tracker.destroy);
    assert.equal(el.value, 'Show current location');
    assert.equal(isHidden('.current-latitude'), true);
    assert.equal(isHidden('.current-longitude'), true);
    assert.equal(isHidden('.current-accuracy'), true);
    assert.equal(isHidden('.use-location'), true);
  });

  it('destroys location tracker on screen switch', function () {
    create();
    toggleTracker();

    selectType('text');

    sinon.assert.calledOnce(tracker.destroy);
  });

  it('does not destroy location tracker twice in type change', function () {
    create();
    toggleTracker();

    selectType('text');
    selectType('answer');

    sinon.assert.calledOnce(tracker.destroy);
  });

  it('does not destroy location tracker twice on toggle click', function () {
    create();
    toggleTracker();

    toggleTracker();
    selectType('text');

    sinon.assert.calledOnce(tracker.destroy);
  });

  it('does not show current location when twiching screen type', function () {
    create();
    var el = toggleTracker();
    selectType('text');
    selectType('navigate');

    assert.equal(el.value, 'Show current location');
    assert.equal(isHidden('.current-latitude'), true);
    assert.equal(isHidden('.current-longitude'), true);
    assert.equal(isHidden('.current-accuracy'), true);
    assert.equal(isHidden('.use-location'), true);
  });

  it('shows current position from tracker', function () {
    create();
    toggleTracker();

    tracker.emit('position', {
      latitude: 6.7890,
      longitude: 1.2345,
      accuracy: 5
    });

    assert.equal(div.querySelector('.current-latitude').textContent,
                 '6.789000');
    assert.equal(div.querySelector('.current-longitude').textContent,
                 '1.234500');
    assert.equal(div.querySelector('.current-accuracy').textContent, '5');
  });

  it('uses current location and stops tracking', function () {
    create();
    var el = toggleTracker();
    tracker.emit('position', {
      latitude: 6.7890,
      longitude: 1.2345,
      accuracy: 5
    });

    div.querySelector('input[name=use-location]').click();

    assert.equal(div.querySelector('[name=latitude]').value, '6.789000');
    assert.equal(div.querySelector('[name=longitude]').value, '1.234500');
    assert.equal(el.value, 'Show current location');
    assert.equal(isHidden('.current-latitude'), true);
    assert.equal(isHidden('.current-longitude'), true);
    assert.equal(isHidden('.current-accuracy'), true);
    assert.equal(isHidden('.use-location'), true);
  });

  it('does not show color-steps by default', function () {
    create();

    assert.equal(isHidden('.color-steps'), true);
  });

  it('shows color-steps when enabed with default value', function () {
    create();
    var colors = div.querySelector('[name=colors]');

    colors.checked = true;
    colors.onchange();

    assert.equal(isHidden('.color-steps'), false);
    assert.equal(div.querySelector('[name=color-steps]').value, '5');
  });

  it('hides color-steps when disabed', function () {
    create();
    var colors = div.querySelector('[name=colors]');
    colors.checked = true;
    colors.onchange();

    colors.checked = false;
    colors.onchange();

    assert.equal(isHidden('.color-steps'), true);
  });

  it('sets coordinates from config', function () {
    create({
      latitude: '1.234',
      longitude: '1.345',
      radius: '6'
    });

    assert.equal(div.querySelector('[name=latitude]').value, '1.234');
    assert.equal(div.querySelector('[name=longitude]').value, '1.345');
    assert.equal(div.querySelector('[name=radius]').value, '6');
  });

  it('defaults coordinates to empty strings', function () {
    create();

    assert.equal(div.querySelector('[name=latitude]').value, '');
    assert.equal(div.querySelector('[name=longitude]').value, '');
    assert.equal(div.querySelector('[name=radius]').value, '');
  });

  it('checks checkboxes according to options', function () {
    create({
      options: {
        compass: true,
        distance: true,
        colorSteps: '5'
      }
    });

    assert.equal(div.querySelector('[name=compass]').checked, true);
    assert.equal(div.querySelector('[name=distance]').checked, true);
    assert.equal(div.querySelector('[name=colors]').checked, true);
    assert.equal(isHidden('.color-steps'), false);
    assert.equal(div.querySelector('[name=color-steps]').value, '5');
  });

  it('defaults checkboxes if no options are given', function () {
    create();

    assert.equal(div.querySelector('[name=compass]').checked, true);
    assert.equal(div.querySelector('[name=distance]').checked, true);
    assert.equal(div.querySelector('[name=colors]').checked, false);
    assert.equal(isHidden('.color-steps'), true);
    assert.equal(div.querySelector('[name=color-steps]').value, '');
  });

  it('can disable checkboxes that default to true', function () {
    create({
      options: {
        compass: false,
        distance: false
      }
    });

    assert.equal(div.querySelector('[name=compass]').checked, false);
    assert.equal(div.querySelector('[name=distance]').checked, false);
  });

});

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

  function $(query) {
    return div.querySelector(query);
  }

  function create(config) {
    config = config || {};
    config.type = 'navigate';
    return editScreen.create(div, config);
  }

  function selectType(type) {
    var typeSelect = $('select[name=type]');
    typeSelect.value = type;
    typeSelect.onchange();
  }

  function toggleTracker() {
    var el = $('input[name=toggle-tracker]');
    el.click();
    return el;
  }

  function isHidden(query) {
    return $(query).classList.contains('hidden');
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

    assert.equal($('.current-latitude').textContent, '6.789000');
    assert.equal($('.current-longitude').textContent, '1.234500');
    assert.equal($('.current-accuracy').textContent, '5');
  });

  it('uses current location and stops tracking', function () {
    create();
    var el = toggleTracker();
    tracker.emit('position', {
      latitude: 6.7890,
      longitude: 1.2345,
      accuracy: 5
    });

    $('input[name=use-location]').click();

    assert.equal($('[name=latitude]').value, '6.789000');
    assert.equal($('[name=longitude]').value, '1.234500');
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
    var colors = $('[name=colors]');

    colors.checked = true;
    colors.onchange();

    assert.equal(isHidden('.color-steps'), false);
    assert.equal($('[name=color-steps]').value, '5');
  });

  it('hides color-steps when disabed', function () {
    create();
    var colors = $('[name=colors]');
    colors.checked = true;
    colors.onchange();

    colors.checked = false;
    colors.onchange();

    assert.equal(isHidden('.color-steps'), true);
  });

  it('sets coordinates from config', function () {
    create({
      locations: {
        test: {
          type: 'circle',
          center: {
            latitude: 1.234,
            longitude: 1.345
          },
          radius: 6
        }
      },
      location: 'test'
    });

    assert.equal($('[name=location-name]').value, 'test');
    assert.equal($('[name=latitude]').value, '1.234');
    assert.equal($('[name=longitude]').value, '1.345');
    assert.equal($('[name=radius]').value, '6');
  });

  it('defaults coordinates to empty strings', function () {
    create();

    assert.equal($('[name=latitude]').value, '');
    assert.equal($('[name=longitude]').value, '');
    assert.equal($('[name=radius]').value, '');
  });

  it('checks checkboxes according to options', function () {
    create({
      options: {
        compass: true,
        distance: true,
        colorSteps: 5
      }
    });

    assert.equal($('[name=compass]').checked, true);
    assert.equal($('[name=distance]').checked, true);
    assert.equal($('[name=colors]').checked, true);
    assert.equal(isHidden('.color-steps'), false);
    assert.equal($('[name=color-steps]').value, '5');
  });

  it('defaults checkboxes if no options are given', function () {
    create();

    assert.equal($('[name=compass]').checked, true);
    assert.equal($('[name=distance]').checked, true);
    assert.equal($('[name=colors]').checked, false);
    assert.equal(isHidden('.color-steps'), true);
    assert.equal($('[name=color-steps]').value, '');
  });

  it('can disable checkboxes that default to true', function () {
    create({
      options: {
        compass: false,
        distance: false
      }
    });

    assert.equal($('[name=compass]').checked, false);
    assert.equal($('[name=distance]').checked, false);
  });

  it('shows available locations in location dropdown', function () {
    create({
      locations: {
        a: {},
        b: {},
        c: {}
      },
      location: 'b'
    });
    var options = div.querySelectorAll('[name=location] option');

    assert.equal(options.length, 4);
    assert.equal(options[0].value, '+');
    assert.equal(options[1].value, 'a');
    assert.equal(options[2].value, 'b');
    assert.equal(options[3].value, 'c');
    assert.equal(options[0].textContent, 'New Location');
    assert.equal(options[1].textContent, 'a');
    assert.equal(options[2].textContent, 'b');
    assert.equal(options[3].textContent, 'c');
    assert.equal(options[0].selected, false);
    assert.equal(options[1].selected, false);
    assert.equal(options[2].selected, true);
    assert.equal(options[3].selected, false);
  });

  it('does not show "start" location in "start" screen', function () {
    create({
      locations: {
        start: {},
        a: {},
        b: {}
      },
      name: 'start'
    });
    var options = div.querySelectorAll('[name=location] option');

    assert.equal(options.length, 3);
    assert.equal(options[0].value, '+');
    assert.equal(options[1].value, 'a');
    assert.equal(options[2].value, 'b');
  });

  it('sets details of selected location on selection change', function () {
    create({
      locations: {
        a: {
          type: 'circle',
          center: {
            latitude: 1.234,
            longitude: 2.345
          },
          radius: 5
        },
        b: {
          type: 'circle',
          center: {
            latitude: 1.345,
            longitude: 2.456
          },
          radius: 7
        }
      },
      location: 'a'
    });

    var location = $('[name=location]');
    location.value = 'b';
    location.onchange();

    assert.equal($('[name=location-name]').value, 'b');
    assert.equal($('[name=latitude]').value, '1.345');
    assert.equal($('[name=longitude]').value, '2.456');
    assert.equal($('[name=radius]').value, '7');
  });

  it('sets location-name to empty string for new location', function () {
    create({
      locations: {
        test: {}
      },
      location: 'test'
    });

    var location = $('[name=location]');
    location.value = '+';
    location.onchange();

    assert.equal($('[name=location-name]').value, '');
  });

  it('saves location', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there']
    });
    var spy = sinon.spy();
    editor.on('location.save', spy);

    $('[name=location-name]').value = 'This location';
    $('[name=latitude]').value = '1.345';
    $('[name=longitude]').value = '2.456';
    $('[name=radius]').value = '7';
    $('.action.save').onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'This location', {
      type: 'circle',
      center: {
        latitude: 1.345,
        longitude: 2.456
      },
      radius: 7
    });
  });

  it('renames location', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there'],
      locations: {
        'This location': {}
      }
    });
    var spy = sinon.spy();
    editor.on('location.rename', spy);

    $('[name=location]').value = 'This location';
    $('[name=location-name]').value = 'That location';
    $('.action.save').onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'This location', 'That location');
  });

  it('does not rename location if name did not change', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there'],
      locations: {
        'This location': {}
      }
    });
    var spy = sinon.spy();
    editor.on('location.rename', spy);

    $('[name=location]').value = 'This location';
    $('[name=location-name]').value = 'This location';
    $('.action.save').onclick();

    sinon.assert.notCalled(spy);
  });

  it('does not rename location if it is a new location', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there'],
      locations: {
        'This location': {}
      }
    });
    var spy = sinon.spy();
    editor.on('location.rename', spy);

    $('[name=location]').value = '+';
    $('[name=location-name]').value = 'That location';
    $('.action.save').onclick();

    sinon.assert.notCalled(spy);
  });

  it('saves screen', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there'],
      locations: {
        'This location': {}
      }
    });
    var spy = sinon.spy();
    editor.on('screen.save', spy);

    $('[name=screen-name]').value = 'That screen';
    $('[name=location]').value = 'This location';
    $('[name=location-name]').value = 'This location';
    $('[name=compass]').checked = false;
    $('[name=distance]').checked = false;
    $('[name=colors]').checked = true;
    $('[name=color-steps]').value = '7';
    $('[name=next-screen]').value = 'go-there';
    $('.action.save').onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'That screen', {
      type: 'navigate',
      location: 'This location',
      options: {
        compass: false,
        distance: false,
        colorSteps: 7
      },
      next: 'go-there'
    });
  });

});

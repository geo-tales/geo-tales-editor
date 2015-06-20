/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var editStory = require('../lib/edit-story');


describe('edit-story', function () {
  var div;
  var api;

  beforeEach(function () {
    div = document.createElement('div');
    api = editStory.create(div, {
      locations: {
        start: {},
        somewhere: {},
        elsewhere: {}
      },
      screens: {
        start: {},
        maze: {},
        finish: {}
      }
    });
  });

  it('renders locations', function () {
    var links = div.querySelectorAll('.locations li a');
    assert.equal(links.length, 3);
    assert.equal(links[0].textContent, 'start');
    assert.equal(links[1].textContent, 'somewhere');
    assert.equal(links[2].textContent, 'elsewhere');
  });

  it('renders screens', function () {
    var links = div.querySelectorAll('.screens li a');
    assert.equal(links.length, 3);
    assert.equal(links[0].textContent, 'start');
    assert.equal(links[1].textContent, 'maze');
    assert.equal(links[2].textContent, 'finish');
  });

  it('emits "location.edit" on location click', function () {
    var spy = sinon.spy();
    api.on('location.edit', spy);
    var links = div.querySelectorAll('.locations li a');

    links[1].onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'somewhere');
  });

  it('emits "screen.edit" on location click', function () {
    var spy = sinon.spy();
    api.on('screen.edit', spy);
    var links = div.querySelectorAll('.screens li a');

    links[1].onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'maze');
  });

  it('emits "location.delete" on location delete button click', function () {
    var spy = sinon.spy();
    api.on('location.delete', spy);
    var links = div.querySelectorAll('.locations li [name=delete]');

    links[1].onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'somewhere');
  });

  it('emits "screen.delete" on location delete button click', function () {
    var spy = sinon.spy();
    api.on('screen.delete', spy);
    var links = div.querySelectorAll('.screens li [name=delete]');

    links[1].onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'maze');
  });

  function isHidden(element) {
    return element.classList.contains('hidden');
  }

  it('disables start location and start / finish screen delete', function () {
    var locations = div.querySelectorAll('.locations li [name=delete]');
    var screens = div.querySelectorAll('.screens li [name=delete]');

    assert.equal(isHidden(locations[0]), true);
    assert.equal(isHidden(locations[1]), false);
    assert.equal(isHidden(locations[2]), false);
    assert.equal(isHidden(screens[0]), true);
    assert.equal(isHidden(screens[1]), false);
    assert.equal(isHidden(screens[2]), true);
  });

  it('emits "location.add" on location add button click', function () {
    var spy = sinon.spy();
    api.on('location.add', spy);

    div.querySelector('[name=location-add]').onclick();

    sinon.assert.calledOnce(spy);
  });

  it('emits "screen.add" on location add button click', function () {
    var spy = sinon.spy();
    api.on('screen.add', spy);

    div.querySelector('[name=screen-add]').onclick();

    sinon.assert.calledOnce(spy);
  });

});

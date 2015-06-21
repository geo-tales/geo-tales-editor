/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var hyperglue = require('hyperglue');
var editStory = require('../lib/edit-story');
var editIndex = require('../lib/edit-index');
var editScreen = require('../lib/edit-screen');
var editLocation = require('../lib/edit-location');

document.body.appendChild(hyperglue('<div id="header"><h1></h1></div>'));
var title = document.body.querySelector('#header h1');

describe('edit-story', function () {
  var div;
  var story;

  beforeEach(function () {
    sinon.spy(editIndex, 'create');
    sinon.spy(editScreen, 'create');
    sinon.spy(editLocation, 'create');
    div = document.createElement('div');
    story = {
      locations: {
        start: {},
        somewhere: {}
      },
      screens: {
        start: {
          type: 'text',
          next: 'maze'
        },
        maze: {
          type: 'navigate',
          location: 'somewhere',
          next: 'finish'
        },
        finish: {
          type: 'finish'
        }
      }
    };
    editStory.create(div, story);
  });

  afterEach(function () {
    editIndex.create.restore();
    editScreen.create.restore();
    editLocation.create.restore();
  });

  it('creates edit-index by default', function () {
    assert.equal(title.textContent, 'Story Index');
    sinon.assert.calledOnce(editIndex.create);
  });

  it('create edit-screen on screen click', function () {
    div.querySelectorAll('.screens li a')[0].onclick();

    assert.equal(title.textContent, 'Screen');
    sinon.assert.calledOnce(editScreen.create);
  });

  it('create edit-location on location click', function () {
    div.querySelectorAll('.locations li a')[0].onclick();

    assert.equal(title.textContent, 'Location');
    sinon.assert.calledOnce(editLocation.create);
  });

  it('adds screen', function () {
    div.querySelector('[name=screen-add]').onclick();

    assert.equal(title.textContent, 'Screen');
    sinon.assert.calledOnce(editScreen.create);
  });

  it('adds location', function () {
    div.querySelector('[name=location-add]').onclick();

    assert.equal(title.textContent, 'Location');
    sinon.assert.calledOnce(editLocation.create);
  });

  it('saves modified text screen', function () {
    div.querySelectorAll('.screens li a')[0].onclick();

    div.querySelector('[name=text]').value = '## Cool';
    div.querySelector('.action.save').onclick();

    assert.deepEqual(story.screens.start, {
      type: 'text',
      text: '## Cool',
      next: 'maze'
    });
  });

  it('saves modified location', function () {
    div.querySelectorAll('.locations li a')[0].onclick();

    div.querySelector('[name=latitude]').value = '1.234';
    div.querySelector('[name=longitude]').value = '2.345';
    div.querySelector('[name=radius]').value = '5';
    div.querySelector('.action.save').onclick();

    assert.deepEqual(story.locations.start, {
      type: 'circle',
      center: {
        latitude: 1.234,
        longitude: 2.345
      },
      radius: 5
    });
  });

  it('changes location name via location editor', function () {
    div.querySelectorAll('.locations li a')[1].onclick();

    div.querySelector('[name=location-name]').value = 'elsewhere';
    div.querySelector('.action.save').onclick();

    assert.equal(story.locations.hasOwnProperty('elsewhere'), true);
    assert.equal(story.locations.hasOwnProperty('somewhere'), false);
    assert.equal(story.screens.maze.location, 'elsewhere');
  });

  it('changes location name via screen editor', function () {
    div.querySelectorAll('.screens li a')[1].onclick();

    div.querySelector('[name=location-name]').value = 'elsewhere';
    div.querySelector('.action.save').onclick();

    assert.equal(story.locations.hasOwnProperty('elsewhere'), true);
    assert.equal(story.locations.hasOwnProperty('somewhere'), false);
    assert.equal(story.screens.maze.location, 'elsewhere');
  });

  it('changes screen name', function () {
    story.screens.foo = {
      type: 'choices',
      choices: [{
        next: 'maze'
      }]
    };
    div.querySelectorAll('.screens li a')[1].onclick();

    div.querySelector('[name=screen-name]').value = 'amazing';
    div.querySelector('.action.save').onclick();

    assert.equal(story.screens.hasOwnProperty('amazing'), true);
    assert.equal(story.screens.hasOwnProperty('maze'), false);
    assert.equal(story.screens.start.next, 'amazing');
    assert.equal(story.screens.foo.choices[0].next, 'amazing');
  });

});

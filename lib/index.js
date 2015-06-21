/*global document*/
'use strict';

var editStory = require('./edit-story');
var editLocation = require('./edit-location');
var editScreen = require('./edit-screen');

var story = {
  locations: {
    start: {}
  },
  screens: {
    start: {
      type: 'text',
      text: '## Welcome',
      next: 'finish'
    },
    finish: {
      type: 'finish'
    }
  }
};

function copy(json, name) {
  var c = JSON.parse(JSON.stringify(json));
  c.name = name;
  return c;
}

function clear(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var content = document.querySelector('#content');
  var storyEditor = editStory.create(content, story);

  function showLocation(config) {
    clear(content);
    editLocation.create(content, config);
  }

  function showScreen(config) {
    clear(content);
    config.screenNames = Object.keys(story.screens);
    config.locations = JSON.parse(JSON.stringify(story.locations));
    editScreen.create(content, config);
  }

  storyEditor.on('location.edit', function (name) {
    showLocation(copy(story.locations[name], name));
  });
  storyEditor.on('screen.edit', function (name) {
    showScreen(copy(story.screens[name], name));
  });

  storyEditor.on('location.add', function () {
    showLocation({});
  });
  storyEditor.on('screen.add', function () {
    showScreen({});
  });
});

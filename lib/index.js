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

function copy(json) {
  return JSON.parse(JSON.stringify(json));
}

function clear(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.firstChild);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var content = document.querySelector('#content');
  var storyEditor = editStory.create(content, story);

  storyEditor.on('location.edit', function (name) {
    clear(content);
    var config = copy(story.locations[name]);
    config.name = name;
    editLocation.create(content, config);
  });

  storyEditor.on('screen.edit', function (name) {
    clear(content);
    var config = copy(story.screens[name]);
    config.name = name;
    editScreen.create(content, config);
  });
//editor.on('updated', function (config) {
//  console.log(JSON.stringify(config, null, '  '));
//});
});

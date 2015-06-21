/*global document, alert*/
'use strict';

var editIndex = require('./edit-index');
var editLocation = require('./edit-location');
var editScreen = require('./edit-screen');
var editJson = require('./edit-json');

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

function scrollTop() {
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

exports.create = function (content, story) {
  var showIndexEditor;

  function showLocation(config) {
    clear(content);
    var locationEditor = editLocation.create(content, config);
    locationEditor.on('location.save', function (name, data) {
      story.locations[name] = data;
      showIndexEditor();
    });
    locationEditor.on('cancel', showIndexEditor);
  }

  function saveScreen(name, data, callback) {
    story.screens[name] = data;
    if (callback) {
      callback(name, data);
    }
    scrollTop();
  }

  function showScreen(config, callback) {
    clear(content);
    config.screenNames = Object.keys(story.screens);
    config.locations = JSON.parse(JSON.stringify(story.locations));
    var screenEditor = editScreen.create(content, config);
    screenEditor.on('location.save', function (name, data) {
      story.locations[name] = data;
    });
    screenEditor.on('screen.save', function (name, data) {
      saveScreen(name, data, callback);
      showIndexEditor();
    });
    screenEditor.on('screen.next', function (name, data) {
      saveScreen(name, data, callback);
      if (data.next) {
        showScreen(copy(story.screens[data.next], data.next));
      } else {
        showScreen({}, function (name) {
          data.next = name;
        });
      }
    });
    screenEditor.on('cancel', showIndexEditor);
    scrollTop();
  }

  function showJson() {
    clear(content);
    var jsonEditor = editJson.create(content, story);
    jsonEditor.on('cancel', function () {
      showIndexEditor();
    });
    jsonEditor.on('import', function (data) {
      story = data;
      showIndexEditor();
    });
    scrollTop();
  }

  showIndexEditor = function () {
    clear(content);
    var storyEditor = editIndex.create(content, story);
    storyEditor.on('location.edit', function (name) {
      showLocation(copy(story.locations[name], name));
    });
    storyEditor.on('screen.edit', function (name) {
      showScreen(copy(story.screens[name], name));
    });
    storyEditor.on('location.delete', function (name) {
      delete story.locations[name];
      showIndexEditor();
    });
    storyEditor.on('screen.delete', function (name) {
      delete story.screens[name];
      showIndexEditor();
    });
    storyEditor.on('location.add', function () {
      showLocation({});
    });
    storyEditor.on('screen.add', function () {
      showScreen({});
    });
    storyEditor.on('json', function () {
      showJson();
    });
    scrollTop();
  };

  showIndexEditor();
};

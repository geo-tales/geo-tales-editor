/*global document, alert*/
'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var editStory = require('./edit-story');
var editLocation = require('./edit-location');
var editScreen = require('./edit-screen');

var jsonHtml = fs.readFileSync(__dirname + '/json.html', 'utf8');

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

function scrollTop() {
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

document.addEventListener('DOMContentLoaded', function () {
  var content = document.querySelector('#content');
  var showStoryEditor;

  function showLocation(config) {
    clear(content);
    var locationEditor = editLocation.create(content, config);
    locationEditor.on('location.save', function (name, data) {
      story.locations[name] = data;
      showStoryEditor();
    });
    locationEditor.on('cancel', showStoryEditor);
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
      showStoryEditor();
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
    screenEditor.on('cancel', showStoryEditor);
    scrollTop();
  }

  showStoryEditor = function showStoryEditor() {
    clear(content);
    var storyEditor = editStory.create(content, story);
    storyEditor.on('location.edit', function (name) {
      showLocation(copy(story.locations[name], name));
    });
    storyEditor.on('screen.edit', function (name) {
      showScreen(copy(story.screens[name], name));
    });
    storyEditor.on('location.delete', function (name) {
      delete story.locations[name];
      showStoryEditor();
    });
    storyEditor.on('screen.delete', function (name) {
      delete story.screens[name];
      showStoryEditor();
    });
    storyEditor.on('location.add', function () {
      showLocation({});
    });
    storyEditor.on('screen.add', function () {
      showScreen({});
    });
    storyEditor.on('json', function () {
      clear(content);
      var jsonElement = hyperglue(jsonHtml, {
        'textarea': JSON.stringify(story, null, '  ')
      });
      jsonElement.querySelector('.action.import').onclick = function () {
        try {
          story = JSON.parse(jsonElement.querySelector('textarea').value);
          showStoryEditor();
        } catch (e) {
          alert('Import failed: ' + String(e));
        }
      };
      jsonElement.querySelector('.action.cancel').onclick = function () {
        showStoryEditor();
      };
      content.appendChild(jsonElement);
      scrollTop();
    });
    scrollTop();
  };

  showStoryEditor();

});

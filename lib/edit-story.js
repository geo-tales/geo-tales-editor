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

function setTitle(title) {
  document.body.querySelector('#header h1').textContent = title;
}

exports.create = function (content, story) {
  var showIndexEditor;
  var screens = story.screens;
  var locations = story.locations;

  function renameLocation(oldName, newName) {
    locations[newName] = locations[oldName];
    delete locations[oldName];
    Object.keys(screens).forEach(function (screenName) {
      var screen = screens[screenName];
      if (screen.location === oldName) {
        screen.location = newName;
      }
    });
  }

  function showLocation(config) {
    clear(content);
    setTitle('Location');
    var locationEditor = editLocation.create(content, config);
    locationEditor.on('location.save', function (name, data) {
      locations[name] = data;
      showIndexEditor();
    });
    locationEditor.on('location.rename', renameLocation);
    locationEditor.on('cancel', showIndexEditor);
  }

  function saveScreen(oldName, name, data, callback) {
    screens[name] = data;
    if (oldName !== name) {
      delete screens[oldName];
      Object.keys(screens).forEach(function (screenName) {
        var screen = screens[screenName];
        if (screen.next === oldName) {
          screen.next = name;
        }
        if (screen.choices) {
          screen.choices.forEach(function (option) {
            if (option.next === oldName) {
              option.next = name;
            }
          });
        }
      });
    }
    if (callback) {
      callback(name, data);
    }
    scrollTop();
  }

  var screenIndex = 0;

  function newScreenConfig() {
    return {
      name: String(++screenIndex)
    };
  }

  function showScreen(config, callback) {
    clear(content);
    setTitle('Screen');
    config.screenNames = Object.keys(screens);
    config.locations = JSON.parse(JSON.stringify(locations));
    var screenEditor = editScreen.create(content, config);
    screenEditor.on('location.save', function (name, data) {
      locations[name] = data;
    });
    screenEditor.on('location.rename', renameLocation);
    screenEditor.on('screen.save', function (name, data) {
      saveScreen(config.name, name, data, callback);
      showIndexEditor();
    });
    screenEditor.on('screen.next', function (name, data) {
      saveScreen(config.name, name, data, callback);
      if (data.next) {
        showScreen(copy(screens[data.next], data.next));
      } else {
        showScreen(newScreenConfig(), function (name) {
          data.next = name;
        });
      }
    });
    screenEditor.on('cancel', showIndexEditor);
    scrollTop();
  }

  function showJson() {
    setTitle('Story JSON');
    clear(content);
    var jsonEditor = editJson.create(content, story);
    jsonEditor.on('cancel', function () {
      showIndexEditor();
    });
    jsonEditor.on('import', function (data) {
      story = data;
      screens = story.screens;
      locations = story.locations;
      Object.keys(screens).forEach(function (key) {
        var i = parseInt(key, 10);
        if (String(i) === key && i > screenIndex) {
          screenIndex = i;
        }
      });
      showIndexEditor();
    });
    scrollTop();
  }

  showIndexEditor = function () {
    clear(content);
    setTitle('Story Index');
    var storyEditor = editIndex.create(content, story);
    storyEditor.on('location.edit', function (name) {
      showLocation(copy(locations[name], name));
    });
    storyEditor.on('screen.edit', function (name) {
      showScreen(copy(screens[name], name));
    });
    storyEditor.on('location.delete', function (name) {
      delete locations[name];
      showIndexEditor();
    });
    storyEditor.on('screen.delete', function (name) {
      delete screens[name];
      showIndexEditor();
    });
    storyEditor.on('location.add', function () {
      showLocation({});
    });
    storyEditor.on('screen.add', function () {
      showScreen(newScreenConfig());
    });
    storyEditor.on('json', function () {
      showJson();
    });
    scrollTop();
  };

  showIndexEditor();
};

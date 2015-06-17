'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var locatify = require('locatify');

var html = fs.readFileSync(__dirname + '/edit-screen.html', 'utf8');
var screenTypes = [
  'text',
  'input',
  'choices',
  'navigate',
  'finish'
];
var screenTypeNames = {
  text: 'Text',
  input: 'Question & Answer',
  choices: 'Multiple Choice',
  navigate: 'Navigation',
  finish: 'Finish'
};

function hideElement(element, hide) {
  if (hide) {
    element.classList.add('hidden');
  } else {
    element.classList.remove('hidden');
  }
}


exports.create = function (parent, config) {
  var editorElement = hyperglue(html, {
    'select[name=type] option': screenTypes.map(function (type) {
      var p = {
        value: type,
        _text: screenTypeNames[type]
      };
      if (type === config.type) {
        p.selected = 'selected';
      }
      return { '*': p };
    })
  });
  parent.appendChild(editorElement);

  var editTextElement = editorElement.querySelector('.edit-text');
  var editAnswerElement = editorElement.querySelector('.edit-answer');
  var editOptionsElement = editorElement.querySelector('.edit-options');
  var editNavigateElement = editorElement.querySelector('.edit-navigate');
  var toggle = editorElement.querySelector('input[name=toggle-tracker]');
  var currentLatitude = editorElement.querySelector('.current-latitude');
  var currentLongitude = editorElement.querySelector('.current-longitude');
  var currentAccuracy = editorElement.querySelector('.current-accuracy');
  var locationTracker;

  function destroyLocationTracker() {
    locationTracker.destroy();
    locationTracker = null;
    toggle.value = 'Show current location';
    currentLatitude.classList.add('hidden');
    currentLongitude.classList.add('hidden');
    currentAccuracy.classList.add('hidden');
  }

  function updateType(type) {
    hideElement(editTextElement, type === 'navigate');
    hideElement(editAnswerElement, type !== 'input');
    hideElement(editOptionsElement, type !== 'choices');
    hideElement(editNavigateElement, type !== 'navigate');
    if (type === 'navigate') {
      toggle.onclick = function () {
        if (locationTracker) {
          destroyLocationTracker();
        } else {
          locationTracker = locatify.create();
          locationTracker.on('position', function (data) {
            currentLatitude.innerHTML = String(data.latitude);
            currentLongitude.innerHTML = String(data.longitude);
            currentAccuracy.innerHTML = String(data.accuracy);
          });
          toggle.value = 'Hide current location';
          currentLatitude.classList.remove('hidden');
          currentLongitude.classList.remove('hidden');
          currentAccuracy.classList.remove('hidden');
        }
      };
    } else if (locationTracker) {
      destroyLocationTracker();
    }
  }

  updateType(config.type);
  editorElement.querySelector('select[name=type]').onchange = function () {
    updateType(this.value);
  };
  var editor = new events.EventEmitter();
  return editor;
};
'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var marked = require('marked');
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
  [].concat(element).forEach(function (element) {
    if (hide) {
      element.classList.add('hidden');
    } else {
      element.classList.remove('hidden');
    }
  });
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
  var togglePreviewLink = editorElement.querySelector('.toggle-preview');
  var editAnswerElement = editorElement.querySelector('.edit-answer');
  var editOptionsElement = editorElement.querySelector('.edit-options');
  var editNavigateElement = editorElement.querySelector('.edit-navigate');
  var toggleTrackerButton = editorElement.querySelector(
    'input[name=toggle-tracker]'
  );
  var useLocation = editorElement.querySelector('.use-location');
  var useLocationButton = editorElement.querySelector(
    'input[name=use-location]'
  );
  var currentLatitude = editorElement.querySelector('.current-latitude');
  var currentLongitude = editorElement.querySelector('.current-longitude');
  var currentAccuracy = editorElement.querySelector('.current-accuracy');
  var locationTracker;

  togglePreviewLink.onclick = function (event) {
    event.stopPropagation();
    var textarea = editTextElement.querySelector('textarea');
    var preview = editTextElement.querySelector('.text-preview');
    var showPreview = this.textContent === 'Preview';
    hideElement(textarea, showPreview);
    hideElement(preview, !showPreview);
    if (showPreview) {
      preview.innerHTML = marked(textarea.value);
    }
    this.textContent = showPreview ? 'Edit' : 'Preview';
  };

  function destroyLocationTracker() {
    locationTracker.destroy();
    locationTracker = null;
    toggleTrackerButton.value = 'Show current location';
    hideElement([
      currentLatitude,
      currentLongitude,
      currentAccuracy,
      useLocation
    ], true);
  }

  var lastPosition;
  toggleTrackerButton.onclick = function () {
    if (locationTracker) {
      destroyLocationTracker();
    } else {
      locationTracker = locatify.create();
      locationTracker.on('position', function (data) {
        lastPosition = data;
        currentLatitude.textContent = String(data.latitude);
        currentLongitude.textContent = String(data.longitude);
        currentAccuracy.textContent = String(data.accuracy);
      });
      toggleTrackerButton.value = 'Hide current location';
      hideElement([
        currentLatitude,
        currentLongitude,
        currentAccuracy,
        useLocation
      ], false);
    }
  };
  useLocationButton.onclick = function () {
    editorElement.querySelector('[name=latitude]').value
        = lastPosition.latitude;
    editorElement.querySelector('[name=longitude]').value
        = lastPosition.longitude;
    destroyLocationTracker();
  };

  function updateType(type) {
    hideElement(editTextElement, type === 'navigate');
    hideElement(editAnswerElement, type !== 'input');
    hideElement(editOptionsElement, type !== 'choices');
    hideElement(editNavigateElement, type !== 'navigate');
    if (locationTracker) {
      destroyLocationTracker();
    }
  }

  updateType(config.type);
  editorElement.querySelector('select[name=type]').onchange = function () {
    updateType(this.value);
  };

  var colorStepsElement = editorElement.querySelector('.color-steps');
  editorElement.querySelector('[name=colors]').onchange = function () {
    hideElement(colorStepsElement, !this.checked);
  };
  var editor = new events.EventEmitter();
  return editor;
};

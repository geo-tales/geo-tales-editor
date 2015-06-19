'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var marked = require('marked');
var locatify = require('locatify');

var html = fs.readFileSync(__dirname + '/edit-screen.html', 'utf8');
var optionHtml = fs.readFileSync(__dirname + '/option.html', 'utf8');
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

function $(el, query) {
  return el.querySelector(query);
}


exports.create = function (parent, config) {

  var screenNameOptions = (config.screenNames || []).map(function (id) {
    return {
      '*': {
        _text: id,
        value: id
      }
    };
  });

  var updates = {
    '[name=screen-name]': {
      value: config.screenName || ''
    },
    '[name=type] option': screenTypes.map(function (type) {
      var p = {
        value: type,
        _text: screenTypeNames[type]
      };
      if (type === config.type) {
        p.selected = 'selected';
      }
      return { '*': p };
    }),
    '[name=text]': config.text || '',
    '[name=answer]': {
      value: config.answer || ''
    },
    '[name=next-screen] option': screenNameOptions,
    '[name=latitude]': {
      value: config.latitude || ''
    },
    '[name=longitude]': {
      value: config.longitude || ''
    },
    '[name=radius]': {
      value: config.radius || ''
    },
    '[name=color-steps]': {
      value: config.colorSteps || ''
    }
  };
  if (config.compass) {
    updates['[name=compass]'] = {
      checked: true
    };
  }
  if (config.distance) {
    updates['[name=distance]'] = {
      checked: true
    };
  }
  if (config.colorSteps) {
    updates['[name=colors]'] = {
      checked: true
    };
  }
  var editorElement = hyperglue(html, updates);
  parent.appendChild(editorElement);

  var editTextElement = $(editorElement, '.edit-text');
  var togglePreviewLink = $(editorElement, '.toggle-preview');
  var editAnswerElement = $(editorElement, '.edit-answer');
  var editOptionsElement = $(editorElement, '.edit-options');
  var addOptionButton = $(editorElement, '.add-option');
  var editNavigateElement = $(editorElement, '.edit-navigate');
  var editNextScreenElement = $(editorElement, '.edit-next-screen');
  var toggleTrackerButton = $(editorElement, 'input[name=toggle-tracker]');
  var useLocation = $(editorElement, '.use-location');
  var useLocationButton = $(editorElement, 'input[name=use-location]');
  var currentLatitude = $(editorElement, '.current-latitude');
  var currentLongitude = $(editorElement, '.current-longitude');
  var currentAccuracy = $(editorElement, '.current-accuracy');
  var locationTracker;

  togglePreviewLink.onclick = function (event) {
    event.stopPropagation();
    var textarea = $(editTextElement, 'textarea');
    var preview = $(editTextElement, '.text-preview');
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
    $(editorElement, '[name=latitude]').value = lastPosition.latitude;
    $(editorElement, '[name=longitude]').value = lastPosition.longitude;
    destroyLocationTracker();
  };

  function updateOption(src, index) {
    return hyperglue(src, {
      '.title': 'Option #' + index,
      '.option-text': {
        name: 'option-text-' + index
      },
      '.option-points': {
        name: 'option-points-' + index
      },
      '.next-screen': {
        name: 'next-screen-' + index
      },
      '.next-screen option': screenNameOptions
    });
  }

  function renumberOptions() {
    var options = editOptionsElement.querySelectorAll('.option');
    Array.prototype.forEach.call(options, function (option, index) {
      editOptionsElement.removeChild(option);
      updateOption(option, index + 1);
      editOptionsElement.insertBefore(option, addOptionButton);
    });
  }

  function addOption() {
    var index = editOptionsElement.querySelectorAll('.option').length + 1;
    var optionElement = updateOption(optionHtml, index);
    editOptionsElement.insertBefore(optionElement, addOptionButton);
    $(optionElement, '.remove-option').onclick = function () {
      editOptionsElement.removeChild(optionElement);
      renumberOptions();
    };
  }
  addOption();

  addOptionButton.onclick = function () {
    addOption();
  };

  function updateType(type) {
    hideElement(editTextElement, type === 'navigate');
    hideElement(editAnswerElement, type !== 'input');
    hideElement(editOptionsElement, type !== 'choices');
    hideElement(editNavigateElement, type !== 'navigate');
    hideElement(editNextScreenElement, type === 'finish');
    if (locationTracker) {
      destroyLocationTracker();
    }
  }

  updateType(config.type);
  $(editorElement, 'select[name=type]').onchange = function () {
    updateType(this.value);
  };

  var colorStepsElement = $(editorElement, '.color-steps');
  if (config.colorSteps) {
    hideElement(colorStepsElement, false);
  }
  $(editorElement, '[name=colors]').onchange = function () {
    if (this.checked) {
      $(editorElement, '[name=color-steps]').value = '5';
    }
    hideElement(colorStepsElement, !this.checked);
  };
  var editor = new events.EventEmitter();
  return editor;
};

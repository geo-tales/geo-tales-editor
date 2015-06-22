'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var marked = require('marked');
var editLocation = require('./location');
var screenTypeNames = require('./screen-type-names');

var html = fs.readFileSync(__dirname + '/edit-screen.html', 'utf8');
var optionHtml = fs.readFileSync(__dirname + '/option.html', 'utf8');
var screenTypes = [
  'text',
  'input',
  'choices',
  'navigate',
  'finish'
];

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

function dropdownOptions(names, selection) {
  return names.map(function (data) {
    if (typeof data === 'string') {
      data = {
        _text: data,
        value: data
      };
    }
    if (data.value === selection) {
      data.selected = true;
    }
    return { '*': data };
  });
}

exports.create = function (parent, config) {
  var screenNames = (config.screenNames || []).filter(function (name) {
    return name !== config.name;
  });
  screenNames.unshift({ value: '', _text: 'None' });
  var locations = config.locations || {};
  var locationNames = Object.keys(locations);
  locationNames.unshift({ value: '+', _text: 'New Location' });
  if (config.name === 'start') {
    locationNames.splice(locationNames.indexOf(config.name), 1);
  }
  var screenNameConfig = {
    value: config.name || ''
  };
  if (config.name === 'start' || config.name === 'finish') {
    screenNameConfig.disabled = true;
  }
  var options = config.options || {};
  if (!options.hasOwnProperty('compass')) {
    options.compass = true;
  }
  if (!options.hasOwnProperty('distance')) {
    options.distance = true;
  }
  var updates = {
    '[name=screen-name]': screenNameConfig,
    '[name=type] option': screenTypes.filter(function (type) {
      return type !== 'finish' || config.name !== 'start';
    }).map(function (type) {
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
    '[name=location] option': dropdownOptions(locationNames, config.location),
    '[name=color-steps]': {
      value: options.colorSteps || ''
    },
    '[name=next-screen] option': dropdownOptions(screenNames, config.next)
  };
  if (options.compass) {
    updates['[name=compass]'] = {
      checked: true
    };
  }
  if (options.distance) {
    updates['[name=distance]'] = {
      checked: true
    };
  }
  if (options.colorSteps) {
    updates['[name=colors]'] = {
      checked: true
    };
  }
  if (config.name === 'finish') {
    updates['[name=type]'] = {
      disabled: true
    };
  }
  var editorElement = hyperglue(html, updates);
  var editNavigateElement = $(editorElement, '.edit-navigate');
  var editLocationElement = $(editorElement, '.edit-navigate-location');
  parent.appendChild(editorElement);

  var locationEditor;
  function showLocation(locationName) {
    if (locationEditor) {
      locationEditor.destroy();
    }
    while (editLocationElement.hasChildNodes()) {
      editLocationElement.removeChild(editLocationElement.firstChild);
    }
    var locationConfig = {};
    var location = locations[locationName];
    if (location) {
      locationConfig = JSON.parse(JSON.stringify(location));
      locationConfig.name = locationName;
    } else {
      locationConfig.name = $(editorElement, '[name=screen-name]').value;
    }
    locationEditor = editLocation.create(editLocationElement, locationConfig);
  }
  editorElement.querySelector('[name=location]').onchange = function () {
    showLocation(this.value);
  };

  var editTextElement = $(editorElement, '.edit-text');
  var togglePreviewLink = $(editorElement, '.toggle-preview');
  var editAnswerElement = $(editorElement, '.edit-answer');
  var editOptionsElement = $(editorElement, '.edit-options');
  var addOptionButton = $(editorElement, '.add-option');
  var editNextScreenElement = $(editorElement, '.edit-next-screen');
  var actionNextButton = $(editorElement, '.action.next');

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

  function updateOption(src, index, choice) {
    index += 1;
    return hyperglue(src, {
      '.title': 'Option #' + index,
      '.option-text': {
        name: 'option-text-' + index,
        value: choice.text || ''
      },
      '.option-points': {
        name: 'option-points-' + index,
        value: choice.points || ''
      },
      '.option-next-screen': {
        name: 'option-next-screen-' + index
      },
      '.option-next-screen option': dropdownOptions(screenNames, choice.next)
    });
  }

  var choices = config.choices || [];
  if (!choices.length) {
    choices.push({});
  }

  function renumberOptions() {
    var elements = editOptionsElement.querySelectorAll('.option');
    Array.prototype.forEach.call(elements, function (element, index) {
      editOptionsElement.removeChild(element);
      updateOption(element, index, {});
      editOptionsElement.insertBefore(element, addOptionButton);
    });
  }

  function addOption(choice, index) {
    var optionElement = updateOption(optionHtml, index, choice || {});
    editOptionsElement.insertBefore(optionElement, addOptionButton);
    $(optionElement, '.remove-option').onclick = function () {
      editOptionsElement.removeChild(optionElement);
      renumberOptions();
    };
  }
  choices.forEach(addOption);

  addOptionButton.onclick = function () {
    var index = choices.length;
    choices.push({});
    addOption(choices[index], index);
  };

  function updateType(type) {
    hideElement(editTextElement, type === 'navigate');
    hideElement(editAnswerElement, type !== 'input');
    hideElement(editOptionsElement, type !== 'choices');
    hideElement(editNavigateElement, type !== 'navigate');
    hideElement(editNextScreenElement, type === 'finish');
    hideElement(actionNextButton, type === 'finish');
    if (locationEditor) {
      locationEditor.destroy();
    }
    if (type === 'navigate') {
      showLocation(config.location);
    }
  }

  updateType(config.type);
  $(editorElement, 'select[name=type]').onchange = function () {
    updateType(this.value);
  };

  var colorStepsElement = $(editorElement, '.color-steps');
  if (options.colorSteps) {
    hideElement(colorStepsElement, false);
  }
  $(editorElement, '[name=colors]').onchange = function () {
    if (this.checked) {
      $(editorElement, '[name=color-steps]').value = '5';
    }
    hideElement(colorStepsElement, !this.checked);
  };

  var editor = new events.EventEmitter();

  function getData() {
    var screenType = $(editorElement, '[name=type]').value;
    var data = {
      type: screenType
    };
    if (screenType === 'navigate') {
      var locationSelection = $(editorElement, '[name=location]').value;
      var locationData = locationEditor.getData();
      var locationName = locationData.name;
      if (locationSelection !== '+' && locationSelection !== locationName) {
        editor.emit('location.rename', locationSelection, locationName);
      }
      editor.emit('location.save', locationName, locationData.data);
      data.location = locationName;
      data.options = {
        compass: $(editorElement, '[name=compass]').checked,
        distance: $(editorElement, '[name=distance]').checked
      };
      if ($(editorElement, '[name=colors]').checked) {
        var colorSteps = $(editorElement, '[name=color-steps]').value;
        data.options.colorSteps = parseInt(colorSteps, 10);
      }
    } else {
      data.text = $(editorElement, '[name=text]').value;
    }
    if (screenType === 'input') {
      data.answer = $(editorElement, '[name=answer]').value;
    } else if (screenType === 'choices') {
      data.choices = choices.map(function (choice, index) {
        /*jslint unparam: true*/
        var i = index + 1;
        var d = {
          text: $(editorElement, '[name=option-text-' + i + ']').value
        };
        var p = $(editorElement, '[name=option-points-' + i + ']').value;
        if (p) {
          d.points = parseInt(p, 10);
        }
        var n = $(editorElement, '[name=option-next-screen-' + i + ']').value;
        if (n) {
          d.next = n;
        }
        return d;
      });
    }
    data.next = $(editorElement, '[name=next-screen]').value;
    return data;
  }

  $(editorElement, '.action.save').onclick = function () {
    var screenName = $(editorElement, '[name=screen-name]').value;
    editor.emit('screen.save', screenName, getData());
  };
  actionNextButton.onclick = function () {
    var screenName = $(editorElement, '[name=screen-name]').value;
    editor.emit('screen.next', screenName, getData());
  };
  editorElement.querySelector('.action.cancel').onclick = function () {
    editor.emit('cancel');
  };

  return editor;
};

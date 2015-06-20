'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var marked = require('marked');
var editLocation = require('./location');

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

function screenNameOptions(screenNames, selection) {
  return screenNames.map(function (name) {
    var data = {
      _text: name,
      value: name
    };
    if (name === selection) {
      data.selected = true;
    }
    return { '*': data };
  });
}

exports.create = function (parent, config) {
  var screenNames = config.screenNames || [];
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
    '[name=next-screen] option': screenNameOptions(screenNames, config.next),
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
  var editNavigateElement = $(editorElement, '.edit-navigate');
  var locationEditor = editLocation.create(editNavigateElement, config);
  parent.appendChild(editorElement);

  var editTextElement = $(editorElement, '.edit-text');
  var togglePreviewLink = $(editorElement, '.toggle-preview');
  var editAnswerElement = $(editorElement, '.edit-answer');
  var editOptionsElement = $(editorElement, '.edit-options');
  var addOptionButton = $(editorElement, '.add-option');
  var editNextScreenElement = $(editorElement, '.edit-next-screen');

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
        value: choice.text
      },
      '.option-points': {
        name: 'option-points-' + index,
        value: choice.points
      },
      '.next-screen': {
        name: 'next-screen-' + index
      },
      '.next-screen option': screenNameOptions(screenNames, choice.next)
    });
  }

  var choices = config.choices || [];
  if (!choices.length) {
    choices.push({});
  }

  function renumberOptions() {
    var options = editOptionsElement.querySelectorAll('.option');
    Array.prototype.forEach.call(options, function (option, index) {
      editOptionsElement.removeChild(option);
      updateOption(option, index, {});
      editOptionsElement.insertBefore(option, addOptionButton);
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
    locationEditor.onUpdateType();
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

'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var locatify = require('locatify');

var html = fs.readFileSync(__dirname + '/location.html', 'utf8');

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
  var options = config.options || {};
  if (!options.hasOwnProperty('compass')) {
    options.compass = true;
  }
  if (!options.hasOwnProperty('distance')) {
    options.distance = true;
  }
  var locationNameConfig = {
    value: config.name || ''
  };
  if (config.name === 'start') {
    locationNameConfig.disabled = true;
  }
  var updates = {
    '[name=location-name]': locationNameConfig,
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
      value: options.colorSteps || ''
    }
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
  var editorElement = hyperglue(html, updates);
  parent.appendChild(editorElement);

  var toggleTrackerButton = $(editorElement, 'input[name=toggle-tracker]');
  var useLocation = $(editorElement, '.use-location');
  var useLocationButton = $(editorElement, 'input[name=use-location]');
  var currentLatitude = $(editorElement, '.current-latitude');
  var currentLongitude = $(editorElement, '.current-longitude');
  var currentAccuracy = $(editorElement, '.current-accuracy');
  var locationTracker;

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
        lastPosition = {
          latitude: data.latitude.toFixed(6),
          longitude: data.longitude.toFixed(6)
        };
        currentLatitude.textContent = lastPosition.latitude;
        currentLongitude.textContent = lastPosition.longitude;
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

  return {
    destroy: function () {
      if (locationTracker) {
        destroyLocationTracker();
      }
    }
  };
};

'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');
var location = require('./location');

var html = fs.readFileSync(__dirname + '/edit-location.html', 'utf8');


exports.create = function (parent, config) {

  var editorElement = hyperglue(html, {});
  var editLocationElement = editorElement.querySelector('.edit-location');
  var locationEditor = location.create(editLocationElement, config);
  parent.appendChild(editorElement);

  var api = new events.EventEmitter();

  editorElement.querySelector('.action.save').onclick = function () {
    locationEditor.destroy();
    var data = locationEditor.getData();
    if (config.name && data.name !== config.name) {
      api.emit('location.rename', config.name, data.name);
    }
    api.emit('location.save', data.name, data.data);
  };
  editorElement.querySelector('.action.cancel').onclick = function () {
    api.emit('cancel');
  };

  return api;
};

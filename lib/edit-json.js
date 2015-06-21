/*global document, alert*/
'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');

var html = fs.readFileSync(__dirname + '/edit-json.html', 'utf8');


exports.create = function (parent, story) {
  var jsonElement = hyperglue(html, {
    textarea: JSON.stringify(story, null, '  ')
  });
  parent.appendChild(jsonElement);

  function $(query) {
    return jsonElement.querySelector(query);
  }

  var jsonEditor = new events.EventEmitter();
  $('.action.import').onclick = function () {
    try {
      jsonEditor.emit('import', JSON.parse($('textarea').value));
    } catch (e) {
      jsonEditor.emit('error', e);
    }
  };
  $('.action.cancel').onclick = function () {
    jsonEditor.emit('cancel');
  };
  return jsonEditor;
};

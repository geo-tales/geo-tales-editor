'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');

var html = fs.readFileSync(__dirname + '/edit-story.html', 'utf8');

function entryMapper(disabled) {
  return function (name) {
    var d = { a: name };
    if (disabled.indexOf(name) !== -1) {
      d['[name=delete]'] = {
        class: 'hidden'
      };
    }
    return d;
  };
}

exports.create = function (parent, config) {

  var locationNames = Object.keys(config.locations);
  var screenNames = Object.keys(config.screens);

  var editorElement = hyperglue(html, {
    '.locations li': locationNames.map(entryMapper(['start'])),
    '.screens li': screenNames.map(entryMapper(['start', 'finish']))
  });

  var api = new events.EventEmitter();

  function emitOnClick(query, event, values) {
    Array.prototype.slice.call(editorElement.querySelectorAll(query))
      .forEach(function (link, index) {
        link.onclick = function () {
          api.emit(event, values[index]);
        };
      });
  }

  emitOnClick('.locations li a', 'location.edit', locationNames);
  emitOnClick('.locations li [name=delete]', 'location.delete', locationNames);
  emitOnClick('.screens li a', 'screen.edit', screenNames);
  emitOnClick('.screens li [name=delete]', 'screen.delete', screenNames);

  editorElement.querySelector('[name=location-add]').onclick = function () {
    api.emit('location.add');
  };
  editorElement.querySelector('[name=screen-add]').onclick = function () {
    api.emit('screen.add');
  };

  parent.appendChild(editorElement);

  return api;
};

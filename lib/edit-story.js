'use strict';

var fs = require('fs');
var events = require('events');
var hyperglue = require('hyperglue');

var html = fs.readFileSync(__dirname + '/edit-story.html', 'utf8');


exports.create = function (parent, config) {

  var locationNames = Object.keys(config.locations);
  var screenNames = Object.keys(config.screens);

  var editorElement = hyperglue(html, {
    '.locations li': locationNames.map(function (name) {
      return {
        'a': name
      };
    }),
    '.screens li': screenNames.map(function (name) {
      return {
        'a': name
      };
    })
  });

  var api = new events.EventEmitter();

  function emitOnClick(query, event, values) {
    Array.prototype.slice.call(editorElement.querySelectorAll(query + ' li a'))
      .forEach(function (link, index) {
        link.onclick = function () {
          api.emit(event, values[index]);
        };
      });
  }

  emitOnClick('.locations', 'location.edit', locationNames);
  emitOnClick('.screens', 'screen.edit', screenNames);

  parent.appendChild(editorElement);

  return api;
};

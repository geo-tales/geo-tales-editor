'use strict';

var fs = require('fs');
var hyperglue = require('hyperglue');
var location = require('./location');

var html = fs.readFileSync(__dirname + '/edit-location.html', 'utf8');


exports.create = function (parent, config) {

  var editorElement = hyperglue(html, {});
  location.create(editorElement, config);
  parent.appendChild(editorElement);

};

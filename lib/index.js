/*global document*/
'use strict';

var editScreen = require('./edit-screen');


document.addEventListener('DOMContentLoaded', function () {
  var content = document.querySelector('#content');
  var editor = editScreen.create(content, {});

  editor.on('updated', function (config) {
    console.log(JSON.stringify(config, null, '  '));
  });
});

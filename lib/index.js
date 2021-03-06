/*global document, alert*/
'use strict';

var editStory = require('./edit-story');

function emptyStory() {
  return {
    locations: {
      start: {}
    },
    screens: {
      start: {
        type: 'text',
        text: '## Welcome'
      }
    }
  };
}

document.addEventListener('DOMContentLoaded', function () {
  var content = document.querySelector('#content');
  editStory.create(content, emptyStory());
});

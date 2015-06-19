/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var marked = require('marked');
var editScreen = require('../lib/edit-screen');


describe('edit-screen input', function () {
  var div;

  function create(config) {
    config = config || {};
    config.type = 'input';
    div = document.createElement('div');
    editScreen.create(div, config);
  }

  it('sets answer value from config', function () {
    create({
      answer: 'secret'
    });

    assert.equal(div.querySelector('[name=answer]').value, 'secret');
  });

  it('defaults answer value to empty string', function () {
    create();

    assert.equal(div.querySelector('[name=answer]').value, '');
  });

});

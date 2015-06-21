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
    return editScreen.create(div, config);
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

  it('saves screen', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there']
    });
    var spy = sinon.spy();
    editor.on('screen.save', spy);

    div.querySelector('[name=screen-name]').value = 'That screen';
    div.querySelector('[name=text]').value = '## Some text';
    div.querySelector('[name=answer]').value = 'secret';
    div.querySelector('[name=next-screen]').value = 'go-there';
    div.querySelector('.action.save').onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'That screen', {
      type: 'input',
      text: '## Some text',
      answer: 'secret',
      next: 'go-there'
    });
  });

});

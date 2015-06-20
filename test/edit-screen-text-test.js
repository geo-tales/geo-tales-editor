/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var marked = require('marked');
var editScreen = require('../lib/edit-screen');


describe('edit-screen text', function () {
  var div;

  function create(config) {
    config = config || {};
    config.type = 'text';
    div = document.createElement('div');
    editScreen.create(div, config);
  }

  function fakeEvent() {
    return {
      stopPropagation: sinon.spy()
    };
  }

  it('renders preview', function () {
    create();
    var event = fakeEvent();

    div.querySelector('.edit-text textarea').value = '## Test\n\nFoo';
    div.querySelector('.toggle-preview').onclick(event);

    sinon.assert.calledOnce(event.stopPropagation);
    assert.equal(div.querySelector('.edit-text textarea').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.edit-text .text-preview').classList
                 .contains('hidden'), false);
    assert.equal(div.querySelector('.toggle-preview').textContent, 'Edit');
    assert.equal(div.querySelector('.edit-text .text-preview').innerHTML,
                 '<h2 id="test">Test</h2>\n<p>Foo</p>\n');
  });

  it('hides preview and shows textarea', function () {
    create();

    div.querySelector('.toggle-preview').onclick(fakeEvent());
    div.querySelector('.toggle-preview').onclick(fakeEvent());

    assert.equal(div.querySelector('.edit-text textarea').classList
                 .contains('hidden'), false);
    assert.equal(div.querySelector('.edit-text .text-preview').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.toggle-preview').textContent, 'Preview');
  });

  it('sets screen-name value from config', function () {
    create({
      name: 'My screen'
    });

    assert.equal(div.querySelector('[name=screen-name]').value, 'My screen');
  });

  function assertScreenNameDisabled(name, disabled) {
    create({ name: name });

    assert.equal(div.querySelector('[name=screen-name]').disabled, disabled);
  }

  it('disables screen-name if "start" or "finish"', function () {
    assertScreenNameDisabled('start', true);
    assertScreenNameDisabled('finish', true);
    assertScreenNameDisabled('foo', false);
  });

  it('defaults screen-name value to empty string', function () {
    create();

    assert.equal(div.querySelector('[name=screen-name]').value, '');
  });

  it('sets text from config', function () {
    create({
      text: '## Some text'
    });

    assert.equal(div.querySelector('[name=text]').textContent, '## Some text');
  });

  it('defaults text value to empty string', function () {
    create();

    assert.equal(div.querySelector('[name=text]').textContent, '');
  });

});

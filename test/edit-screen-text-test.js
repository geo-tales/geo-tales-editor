/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var marked = require('marked');
var editScreen = require('../lib/edit-screen');


describe('edit-screen text', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
    editScreen.create(div, {
      type: 'text'
    });
  });

  function fakeEvent() {
    return {
      stopPropagation: sinon.spy()
    };
  }

  it('renders preview', function () {
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
    div.querySelector('.toggle-preview').onclick(fakeEvent());
    div.querySelector('.toggle-preview').onclick(fakeEvent());

    assert.equal(div.querySelector('.edit-text textarea').classList
                 .contains('hidden'), false);
    assert.equal(div.querySelector('.edit-text .text-preview').classList
                 .contains('hidden'), true);
    assert.equal(div.querySelector('.toggle-preview').textContent, 'Preview');
  });

});

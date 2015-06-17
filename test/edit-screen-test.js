/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var locatify = require('locatify');
var editScreen = require('../lib/edit-screen');


describe('edit-screen', function () {
  var div;

  beforeEach(function () {
    div = document.createElement('div');
    sinon.stub(locatify, 'create');
  });

  afterEach(function () {
    locatify.create.restore();
  });

  function create(config) {
    editScreen.create(div, config || {});
  }

  it('shows dropdown with screen type options', function () {
    create();

    var options = div.querySelectorAll('select[name=type] option');
    assert.equal(options.length, 5);
    assert.equal(options[0].value, 'text');
    assert.equal(options[0].textContent, 'Text');
    assert.equal(options[1].value, 'input');
    assert.equal(options[1].textContent, 'Question & Answer');
    assert.equal(options[2].value, 'choices');
    assert.equal(options[2].textContent, 'Multiple Choice');
    assert.equal(options[3].value, 'navigate');
    assert.equal(options[3].textContent, 'Navigation');
    assert.equal(options[4].value, 'finish');
    assert.equal(options[4].textContent, 'Finish');
  });

  it('selects given type', function () {
    create({ type : 'input' });

    var selected = div.querySelector('select[name=type] option[selected]');
    assert.equal(selected.value, 'input');
  });

  function assertElementHidden(selector, hidden) {
    var textarea = div.querySelector(selector);

    assert.equal(textarea.classList.contains('hidden'), hidden);
  }

  function assertTextEditorHidden(hidden) {
    assertElementHidden('.edit-text', hidden);
  }

  function assertAnswerInputHidden(hidden) {
    assertElementHidden('.edit-answer', hidden);
  }

  it('shows text editor by default', function () {
    create();

    assertTextEditorHidden(false);
  });

  it('shows text editor for type=text', function () {
    create({ type: 'text' });

    assertTextEditorHidden(false);
  });

  it('shows text editor for type=input', function () {
    create({ type: 'input' });

    assertTextEditorHidden(false);
  });

  it('shows text editor for type=choices', function () {
    create({ type: 'choices' });

    assertTextEditorHidden(false);
  });

  it('shows text editor for type=finish', function () {
    create({ type: 'finish' });

    assertTextEditorHidden(false);
  });

  it('does not show text editor for type=navigate', function () {
    create({ type: 'navigate' });

    assertTextEditorHidden(true);
  });

  function selectType(type) {
    var typeSelect = div.querySelector('select[name=type]');
    typeSelect.value = type;
    typeSelect.onchange();
  }

  it('hides text editor when selecting type=navigate', function () {
    create();

    selectType('navigate');

    assertTextEditorHidden(true);
  });

  it('shows text editor when selecting text', function () {
    create({ type: 'navigate' });

    selectType('text');

    assertTextEditorHidden(false);
  });

  it('shows answer input for type=input', function () {
    create({ type: 'input' });

    assertAnswerInputHidden(false);
  });

  it('hides answer input for type=text', function () {
    create({ type: 'text' });

    assertAnswerInputHidden(true);
  });

  it('hides answer input for type=choices', function () {
    create({ type: 'choices' });

    assertAnswerInputHidden(true);
  });

  it('hides answer input when selecting type=finish', function () {
    create({ type: 'input' });

    selectType('finish');

    assertAnswerInputHidden(true);
  });

  it('shows answer input when selecting type=input', function () {
    create();

    selectType('input');

    assertAnswerInputHidden(false);
  });

  it('does not show edit-options by default', function () {
    create();

    assertElementHidden('.edit-options', true);
  });

  it('shows edit-options for type=choices', function () {
    create({ type: 'choices' });

    assertElementHidden('.edit-options', false);
  });

  it('shows edit-options when selecting type=choices', function () {
    create({ type: 'navigate' });

    selectType('choices');

    assertElementHidden('.edit-options', false);
  });

  it('hides edit-options when selecting type=input', function () {
    create({ type: 'choices' });

    selectType('input');

    assertElementHidden('.edit-options', true);
  });

  it('does not show edit-navigate by default', function () {
    create();

    assertElementHidden('.edit-navigate', true);
  });

  it('shows edit-navigate for type=navigate', function () {
    create({ type: 'navigate' });

    assertElementHidden('.edit-navigate', false);
  });

  it('shows edit-navigate when selecting type=navigate', function () {
    create({ type: 'choices' });

    selectType('navigate');

    assertElementHidden('.edit-navigate', false);
  });

  it('hides edit-navigate when selecting type=input', function () {
    create({ type: 'navigate' });

    selectType('input');

    assertElementHidden('.edit-navigate', true);
  });

});

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

  function $(query) {
    return div.querySelector(query);
  }

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
    create({ type: 'input' });

    var selected = $('select[name=type] option[selected]');
    assert.equal(selected.value, 'input');
  });

  function assertElementHidden(selector, hidden) {
    var textarea = $(selector);

    assert.equal(textarea.classList.contains('hidden'), hidden);
  }

  function assertTextEditorHidden(hidden) {
    assertElementHidden('.edit-text', hidden);
  }

  function assertAnswerInputHidden(hidden) {
    assertElementHidden('.edit-answer', hidden);
  }

  function assertNextScreenEditorHidden(hidden) {
    assertElementHidden('.edit-next-screen', hidden);
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

  it('hides text editor for type=navigate', function () {
    create({ type: 'navigate' });

    assertTextEditorHidden(true);
  });

  function selectType(type) {
    var typeSelect = $('select[name=type]');
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

  it('shows next-screen editor for type=text', function () {
    create({ type: 'text' });

    assertNextScreenEditorHidden(false);
  });

  it('shows next-screen editor for type=input', function () {
    create({ type: 'input' });

    assertNextScreenEditorHidden(false);
  });

  it('shows next-screen editor for type=choices', function () {
    create({ type: 'choices' });

    assertNextScreenEditorHidden(false);
  });

  it('shows next-screen editor for type=navigate', function () {
    create({ type: 'navigate' });

    assertNextScreenEditorHidden(false);
  });

  it('hides next-screen editor for type=finish', function () {
    create({ type: 'finish' });

    assertNextScreenEditorHidden(true);
  });

  it('disables name if "start"', function () {
    create({ type: 'text', name: 'start' });

    assert.equal($('[name=screen-name]').disabled, true);
  });

  it('disables name and type if "finish"', function () {
    create({ type: 'finish', name: 'finish' });

    assert.equal($('[name=screen-name]').disabled, true);
    assert.equal($('[name=type]').disabled, true);
  });

  it('does not show type option "finish" for start screen', function () {
    create({ type: 'text', name: 'start' });

    assert.equal($('[name=type] option[value=finish]'), null);
  });

  it('shows type option "finish" for finish screen', function () {
    create({ type: 'finish', name: 'finish' });

    assert.notEqual($('[name=type] [value=finish]'), null);
  });

  it('shows type option "finish" for random screen', function () {
    create({ type: 'answer', name: 'random' });

    assert.notEqual($('[name=type] [value=finish]'), null);
  });

  it('does not show current screen in next-screen options', function () {
    create({ type: 'answer', name: 'random', screenNames: ['foo', 'random'] });

    assert.equal($('[name=next-screen] [value=random]'), null);
    assert.notEqual($('[name=next-screen] [value=foo]'), null);
  });

  it('hides action next button for finish screen', function () {
    create({ type: 'finish' });

    assert.equal($('.action.next').classList.contains('hidden'), true);
  });

  it('shows action next button when selecting anything else', function () {
    create({ type: 'finish' });

    selectType('text');
    assert.equal($('.action.next').classList.contains('hidden'), false);
    selectType('input');
    assert.equal($('.action.next').classList.contains('hidden'), false);
    selectType('choices');
    assert.equal($('.action.next').classList.contains('hidden'), false);
    selectType('navigate');
    assert.equal($('.action.next').classList.contains('hidden'), false);
  });

  it('hides action next button when selecting finish', function () {
    create({ type: 'navigate' });

    selectType('finish');

    assert.equal($('.action.next').classList.contains('hidden'), true);
  });

});

/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var marked = require('marked');
var editScreen = require('../lib/edit-screen');


describe('edit-screen choices', function () {
  var div;

  function $(query) {
    return div.querySelector(query);
  }

  function create(config) {
    config = config || {};
    config.type = 'choices';
    div = document.createElement('div');
    return editScreen.create(div, config);
  }

  it('renders one option by default', function () {
    create();

    assert.equal(div.querySelectorAll('.option').length, 1);
  });

  it('adds option when clicking +', function () {
    create();

    $('.add-option').click();

    assert.equal(div.querySelectorAll('.option').length, 2);
  });

  it('removes option when clicking -', function () {
    create();
    $('.add-option').click();

    div.querySelectorAll('.remove-option')[1].click();

    assert.equal(div.querySelectorAll('.option').length, 1);
  });

  function assertThreeOptions() {
    var titles = div.querySelectorAll('.option .title');
    assert.equal(titles[0].textContent, 'Option #1');
    assert.equal(titles[1].textContent, 'Option #2');
    assert.equal(titles[2].textContent, 'Option #3');
    assert.notEqual($('[name=option-text-1]'), null);
    assert.notEqual($('[name=option-text-2]'), null);
    assert.notEqual($('[name=option-text-3]'), null);
    assert.notEqual($('[name=option-points-1]'), null);
    assert.notEqual($('[name=option-points-2]'), null);
    assert.notEqual($('[name=option-points-3]'), null);
    assert.notEqual($('[name=option-next-screen-1]'), null);
    assert.notEqual($('[name=option-next-screen-2]'), null);
    assert.notEqual($('[name=option-next-screen-3]'), null);
  }

  it('numbers option element names and title', function () {
    create();

    $('.add-option').click();
    $('.add-option').click();

    assertThreeOptions();
  });

  it('re-numbers existing option element names on remove', function () {
    create();

    $('.add-option').click();
    $('.add-option').click();
    $('.add-option').click();

    div.querySelectorAll('.remove-option')[0].click();

    assertThreeOptions();
  });

  function assertScreenNameOptions(query) {
    var options = div.querySelectorAll(query);
    assert.equal(options.length, 4);
    assert.equal(options[0].textContent, 'None');
    assert.equal(options[1].textContent, 'a');
    assert.equal(options[2].textContent, 'b');
    assert.equal(options[3].textContent, 'c');
    assert.equal(options[0].value, '');
    assert.equal(options[1].value, 'a');
    assert.equal(options[2].value, 'b');
    assert.equal(options[3].value, 'c');
  }

  it('fills option-next-screen dropdowns with screenNames from config',
    function () {
      create({
        screenNames: ['a', 'b', 'c']
      });

      assertScreenNameOptions('[name=option-next-screen-1] option');
    });

  it('fills added option-next-screen dropdowns with screenNames from config',
    function () {
      create({
        screenNames: ['a', 'b', 'c']
      });

      $('.add-option').click();

      assertScreenNameOptions('[name=option-next-screen-1] option');
      assertScreenNameOptions('[name=option-next-screen-2] option');
    });

  it('fills next-screen dropdowns with screenNames from config',
    function () {
      create({
        screenNames: ['a', 'b', 'c']
      });

      assertScreenNameOptions('[name=next-screen] option');
    });

  it('selects next-screen according to config.next', function () {
    create({
      screenNames: ['a', 'b'],
      next: 'b'
    });

    assert.equal($('[name=next-screen] [value=b]').selected, true);
  });

  it('sets choices from config', function () {
    create({
      screenNames: ['a', 'b'],
      choices: [{
        text: 'Some text',
        next: 'b'
      }, {
        text: 'Other option',
        points: 3,
        next: 'a'
      }]
    });

    assert.equal(div.querySelectorAll('.option').length, 2);
    assert.equal($('[name=option-text-1]').value, 'Some text');
    assert.equal($('[name=option-text-2]').value, 'Other option');
    assert.equal($('[name=option-points-1]').value, '');
    assert.equal($('[name=option-points-2]').value, '3');
    assert.equal($('[name=option-next-screen-1] [value=a]').selected, false);
    assert.equal($('[name=option-next-screen-1] [value=b]').selected, true);
    assert.equal($('[name=option-next-screen-2] [value=a]').selected, true);
    assert.equal($('[name=option-next-screen-2] [value=b]').selected, false);
  });

  it('saves screen', function () {
    var editor = create({
      screenNames: ['go-here', 'go-there']
    });
    var spy = sinon.spy();
    editor.on('screen.save', spy);

    $('.add-option').click();
    $('[name=screen-name]').value = 'That screen';
    $('[name=text]').value = '## Some text';
    $('[name=option-text-1]').value = 'A';
    $('[name=option-text-2]').value = 'B';
    $('[name=option-points-1]').value = '5';
    $('[name=option-points-2]').value = '';
    $('[name=option-next-screen-1]').value = '';
    $('[name=option-next-screen-2]').value = 'go-here';
    $('[name=next-screen]').value = 'go-there';
    $('.action.save').onclick();

    sinon.assert.calledOnce(spy);
    sinon.assert.calledWith(spy, 'That screen', {
      type: 'choices',
      text: '## Some text',
      choices: [{
        text: 'A',
        points: 5
      }, {
        text: 'B',
        next: 'go-here'
      }],
      next: 'go-there'
    });
  });

});

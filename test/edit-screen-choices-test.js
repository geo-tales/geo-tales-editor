/*global describe, it, beforeEach, afterEach, document*/
'use strict';

var assert = require('assert');
var sinon = require('sinon');
var marked = require('marked');
var editScreen = require('../lib/edit-screen');


describe('edit-screen choices', function () {
  var div;

  function create(config) {
    config = config || {};
    config.type = 'choices';
    div = document.createElement('div');
    editScreen.create(div, config);
  }

  it('renders one option by default', function () {
    create();

    assert.equal(div.querySelectorAll('.option').length, 1);
  });

  it('adds option when clicking +', function () {
    create();

    div.querySelector('.add-option').click();

    assert.equal(div.querySelectorAll('.option').length, 2);
  });

  it('removes option when clicking -', function () {
    create();
    div.querySelector('.add-option').click();

    div.querySelectorAll('.remove-option')[1].click();

    assert.equal(div.querySelectorAll('.option').length, 1);
  });

  function assertThreeOptions() {
    var titles = div.querySelectorAll('.option .title');
    assert.equal(titles[0].textContent, 'Option #1');
    assert.equal(titles[1].textContent, 'Option #2');
    assert.equal(titles[2].textContent, 'Option #3');
    assert.notEqual(div.querySelector('[name=option-text-1]'), null);
    assert.notEqual(div.querySelector('[name=option-text-2]'), null);
    assert.notEqual(div.querySelector('[name=option-text-3]'), null);
    assert.notEqual(div.querySelector('[name=option-points-1]'), null);
    assert.notEqual(div.querySelector('[name=option-points-2]'), null);
    assert.notEqual(div.querySelector('[name=option-points-3]'), null);
    assert.notEqual(div.querySelector('[name=next-screen-1]'), null);
    assert.notEqual(div.querySelector('[name=next-screen-2]'), null);
    assert.notEqual(div.querySelector('[name=next-screen-3]'), null);
  }

  it('numbers option element names and title', function () {
    create();

    div.querySelector('.add-option').click();
    div.querySelector('.add-option').click();

    assertThreeOptions();
  });

  it('re-numbers existing option element names on remove', function () {
    create();

    div.querySelector('.add-option').click();
    div.querySelector('.add-option').click();
    div.querySelector('.add-option').click();

    div.querySelectorAll('.remove-option')[0].click();

    assertThreeOptions();
  });

  function assertScreenNameOptions(query) {
    var options = div.querySelectorAll(query);
    assert.equal(options.length, 3);
    assert.equal(options[0].textContent, 'a');
    assert.equal(options[1].textContent, 'b');
    assert.equal(options[2].textContent, 'c');
    assert.equal(options[0].value, 'a');
    assert.equal(options[1].value, 'b');
    assert.equal(options[2].value, 'c');
  }

  it('fills next-screen dropdowns with screenNames from config', function () {
    create({
      screenNames: ['a', 'b', 'c']
    });

    assertScreenNameOptions('[name=next-screen-1] option');
  });

  it('fills added next-screen dropdowns with screenNames from config',
    function () {
      create({
        screenNames: ['a', 'b', 'c']
      });

      div.querySelector('.add-option').click();

      assertScreenNameOptions('[name=next-screen-1] option');
      assertScreenNameOptions('[name=next-screen-2] option');
    });

  it('fills next-screen dropdowns with screenNames from config',
    function () {
      create({
        screenNames: ['a', 'b', 'c']
      });

      assertScreenNameOptions('[name=next-screen] option');
    });

});

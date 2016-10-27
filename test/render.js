const Plugin = require('..');
const RenderResult = require('../node_modules/stromboli/lib/render-result.js');
const test = require('tap').test;
const path = require('path');
const fs = require('fs');

var plugin = new Plugin({});

test('render', function (t) {
  t.plan(4);

  var renderResult = new RenderResult();

  return plugin.render(path.resolve('test/render/valid/index.md'), renderResult).then(
    function(renderResult) {
      t.equal(renderResult.getDependencies().size, 3);
      t.equal(renderResult.getBinaries().length, 1);
      t.equal(renderResult.getBinaries()[0].name, 'index.md');
      t.equal(renderResult.getBinaries()[0].data, '<p><code>sub/include.md</code>\n<code>include.md</code></p>\n<p><code>index.md</code></p>\n');

    },
    function(err) {
      t.fail(err);
    }
  );
});

test('render with error', function (t) {
  t.plan(1);

  var renderResult = new RenderResult();

  return plugin.render(path.resolve('test/render/error/index.md'), renderResult).then(
    function(renderResult) {
      t.fail();
    },
    function(err) {
      t.pass(err);
    }
  );
});

test('render with circular', function (t) {
  t.plan(1);

  var renderResult = new RenderResult();

  return plugin.render(path.resolve('test/render/circular/index.md'), renderResult).then(
    function(renderResult) {
      t.fail();
    },
    function(err) {
      t.pass(err);
    }
  );
});
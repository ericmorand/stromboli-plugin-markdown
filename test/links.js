const Plugin = require('..');
const RenderResult = require('../node_modules/stromboli/lib/render-result.js');
const test = require('tap').test;
const path = require('path');
const fs = require('fs');

var plugin = new Plugin({});

test('external links', function (t) {
  t.plan(4);

  var renderResult = new RenderResult();

  return plugin.render(path.resolve('test/links/external/README.md'), renderResult).then(
    function(renderResult) {
      t.equal(renderResult.getDependencies().size, 1);
      t.equal(renderResult.getBinaries().length, 1);
      t.equal(renderResult.getBinaries()[0].name, 'README.html');
      t.equal(renderResult.getBinaries()[0].data, '<p><a href="//google.ch">External link</a>\n<a href="http://google.ch">External link with protocol</a></p>\n');

    },
    function(err) {
      t.fail(err);
    }
  );
});

test('internal links', function (t) {
  t.plan(4);

  var renderResult = new RenderResult();

  return plugin.render(path.resolve('test/links/internal/README.md'), renderResult).then(
    function(renderResult) {
      t.equal(renderResult.getDependencies().size, 2);
      t.equal(renderResult.getBinaries().length, 1);
      t.equal(renderResult.getBinaries()[0].name, 'README.html');
      t.equal(renderResult.getBinaries()[0].data, '<p>Internal link<p><code>include</code></p>\n\nInternal link with dot<p><code>include</code></p>\n</p>\n');

    },
    function(err) {
      t.fail(err);
    }
  );
});
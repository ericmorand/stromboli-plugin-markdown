const fs = require('fs-extra');
const path = require('path');
const url = require('url');

const Promise = require('promise');

class Plugin {
  /**
   *
   * @param config {Object}
   */
  constructor(config) {
    this.config = config;
    this.markdown = require('marked');
  }

  /**
   *
   * @param file {String}
   * @param renderResult {StromboliRenderResult}
   * @returns {Promise}
   */
  render(file, renderResult) {
    var that = this;

    return new Promise(function (fulfill, reject) {
      try {
        var result = that.renderFile(file, renderResult);
        var ext = path.extname(file);

        renderResult.addBinary(path.basename(file, ext) + '.html', result);

        fulfill(renderResult);
      }
      catch (err) {
        var error = {
          file: file,
          error: err.message
        };

        reject(error);
      }
    });
  }

  _renderFile(file, renderResult, knownDependencies) {
    var that = this;
    var markdown = that.markdown;
    var readData = fs.readFileSync(file);
    var renderer = new markdown.Renderer();

    // console.log(knownDependencies);

    renderResult.addDependency(file);

    if (!knownDependencies.has(file)) {
      knownDependencies.set(file, new Set());
    }

    var fileKnownDependencies = knownDependencies.get(file);

    renderer.link = function (href, title, text) {
      var result = null;
      var linkUrl = url.parse(href);

      if (linkUrl.slashes == null) {
        var includedFile = path.resolve(path.join(path.dirname(file), href));

        try {
          fs.statSync(includedFile);
        }
        catch (err) {
          includedFile = null;
        }

        if (includedFile) {
          if (knownDependencies.has(includedFile)) {
            var includedFileKnownDependencies = knownDependencies.get(includedFile);

            if (includedFileKnownDependencies.has(file)) {
              throw new Error('Circular include ' + href);
            }
          }

          fileKnownDependencies.add(includedFile);

          var renderFileResult = that._renderFile(includedFile, renderResult, knownDependencies);

          result = '';

          if (title) {
            result = '<a id="' + title + '">' + text + '</a>';
          }
          else {
            result = text;
          }

          result += renderFileResult;
        }
      }

      if (!result) {
        result = markdown.Renderer.prototype.link.call(markdown, href, title, text);
      }

      return result;
    };

    return that.markdown(readData.toString(), {renderer: renderer});
  }

  renderFile(file, renderResult) {
    var that = this;
    var knownDependencies = new Map();

    return that._renderFile(file, renderResult, knownDependencies);
  }
}

module.exports = Plugin;
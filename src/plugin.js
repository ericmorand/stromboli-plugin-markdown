const fs = require('fs-extra');
const path = require('path');

const Promise = require('promise');
const marked = require('marked');

class Plugin {
  /**
   *
   * @param config {Object}
   */
  constructor(config) {
    this.config = config;
    this.markdown = require('marked');

    /**
     *
     * @param file
     * @param renderResult {StromboliRenderResult}
     * @returns {String}
     * @private
     */
    this._compileFile = function (file, renderResult) {
      var that = this;
      var readData = fs.readFileSync(file);
      var result = readData.toString();

      var includePattern = /^(?:\\include)\s"((?:.+)\.(?:.*))"/gm; // @see https://regex101.com/r/8lc5gV/4
      var matches = null;

      renderResult.addDependency(file);

      while (matches = includePattern.exec(result)) {
        var match = matches[0];
        var includedFile = path.resolve(path.join(path.dirname(file), matches[1]));

        if (renderResult.getDependencies().has(includedFile)) {
          throw new Error('Circular include ' + match, file);
        }
        else {
          result = result.replace(match, that._compileFile(includedFile, renderResult));
        }
      }

      return result;
    };
  }

  /**
   *
   * @param file {String}
   * @param renderResult {StromboliRenderResult}
   * @returns {Promise}
   */
  render(file, renderResult) {
    var that = this;

    try {
      var data = that._compileFile(file, renderResult);

      var marked = Promise.denodeify(that.markdown);

      return marked(data).then(
        function (binary) {
          renderResult.addBinary(path.basename(file), binary);

          return renderResult;
        }
      );
    }
    catch (err) {
      var error = {
        file: err.file || file,
        error: err.message
      };

      return Promise.reject(error);
    }
  }
}

module.exports = Plugin;
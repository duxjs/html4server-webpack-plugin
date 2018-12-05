"use strict";
const _ = require("lodash");
module.exports = class Html4ServerWebpackPlugin {
    constructor(options) {
        this.options = _.extend({}, options || {});
    }

    apply(compiler) {
        // Hook into the html-webpack-plugin processing
        // webpack 4+ comes with a new plugin system
        if (compiler.hooks) {
            compiler.hooks.compilation.tap('Html4ServerWebpackPlugin', compilation => {
                compilation.hooks.htmlWebpackPluginAfterHtmlProcessing.tapAsync(
                    "Html4ServerWebpackPlugin",
                    (htmlPluginData, callback) => {
                        this.writeAssetToDisk(
                            compilation,
                            htmlPluginData.plugin.options,
                            htmlPluginData,
                            callback
                        );
                    }
                );
            });
        } else {
            compiler.plugin("compilation", compilation => {
                compilation.plugin(
                    "html-webpack-plugin-after-html-processing",
                    (htmlPluginData, callback) => {
                        this.writeAssetToDisk(
                            compilation,
                            htmlPluginData.plugin.options,
                            htmlPluginData,
                            callback
                        );
                    }
                );
            });
        }
    }

    writeAssetToDisk(
        compilation,
        htmlWebpackPluginOptions,
        htmlPluginData,
        callback
    ) {
        const { outputName, html } = htmlPluginData;
        if (htmlWebpackPluginOptions.html4ServerPlugin) {
            const {
                templateData,
                filename
            } = htmlWebpackPluginOptions.html4ServerPlugin;
            const assetsName = filename;
            const tmlFunction = _.template(html);
            const newHtml = tmlFunction(templateData);
            const source = "const serialize = require('serialize-javascript'); module.exports = " + tmlFunction;
            compilation.assets[assetsName] = {
                source: function() {
                    return source;
                },
                size: function() {
                    return Buffer.byteLength(source, "utf8");
                }
            };
            htmlPluginData.html = newHtml;
            callback(null, htmlPluginData);
        } else {
            return callback(null);
        }
    }
};

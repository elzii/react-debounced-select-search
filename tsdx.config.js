/* eslint-disable @typescript-eslint/no-var-requires */
const postcss = require('rollup-plugin-postcss');
const cssvariables = require("postcss-css-variables");
const postcssNesting = require("postcss-nesting");
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

module.exports = {
    /**
     * @param {import('rollup/dist/rollup').InputOptions} config
     */
    rollup(config, options) {
        config.plugins.push(
            postcss({
                modules: true,
                plugins: [
                    autoprefixer(),
                    // cssvariables(),
                    postcssNesting(),
                    cssnano({
                        preset: 'default',
                    }),
                ],
                sourceMap: true,
                inject: true,
                extract: false,
            })
        );
        return config;
    },
};
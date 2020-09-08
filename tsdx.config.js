/* eslint-disable @typescript-eslint/no-var-requires */
const postcss = require('rollup-plugin-postcss');
const analyze = require('rollup-plugin-analyzer');
const visualizer = require('rollup-plugin-visualizer');
const copy = require('rollup-plugin-copy');
// const cssvariables = require("postcss-css-variables");
const postcssNesting = require("postcss-nesting");
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

const isProd = process.env.NODE_ENV === 'production'

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
                sourceMap: !isProd,
                inject: true,
                extract: false,
            }),
            copy({
              targets: [
                { src: 'assets/svg/**/*', dest: 'dist/svg' }
              ]
            }),
            visualizer({
              filename: 'stats.html',
              open: true,
              template: 'treemap', // treemap, sunburst, network
              gzipSize: true
            })
            // analyze()
        );
        return config;
    },
};
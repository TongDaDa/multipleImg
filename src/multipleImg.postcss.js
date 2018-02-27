'use strict';
const postcss = require('postcss');

const cleaner = postcss.plugin('postcss-cleaner', () => {
    return (root, result) => {
        console.log(root);
        result.root = postcss.root();
    };
});

module.exports = cleaner;
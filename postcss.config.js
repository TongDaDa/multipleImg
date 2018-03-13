module.exports = {
    plugins: [
        require('precss'),
        require('autoprefixer'),
        require("postcss-cssnext"),
        require("./src/multipleImg.postcss.js")
    ]
}
const BASE_PATH = "../";
const UTILS_PATH = "./utils";
const WEBPACK_CONFIG_FILE = "webpack.config.js";
process.chdir(BASE_PATH);

const gulp = require('gulp');
const less = require('gulp-less');
const path = require('path');
const uglifycss = require('gulp-uglifycss');
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');

const webpack = require('webpack');
const gutil = require('gutil');
const c = require('ansi-colors');
const babel = require('babel-core/register');

gulp.task('less', () => {
    return gulp.src('./src/css/style.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(autoprefixer({
            browsers: ['cover 93%'],
            cascade: false
        }))
        .pipe(uglifycss({
            "maxLineLen": 0,
            "uglyComments": true
        }))
        .pipe(gulp.dest('./src/css'));
});

const onBuild = (done) => {
    return new Promise((resolve, reject) => {
        process.chdir(UTILS_PATH);
        const cacheKey = Object.keys(require.cache).find((value, index, obj) => {
            return value.indexOf(WEBPACK_CONFIG_FILE) !== -1;
        });

        if (cacheKey) delete require.cache[cacheKey];

        const webpackConfig = require('./' + WEBPACK_CONFIG_FILE);
        process.chdir(BASE_PATH);

        const compiler = webpack(webpackConfig);
        compiler.run((err, stats) => {
            if (err) {
                gutil.log('Error', err);
                if (done) {
                    done();
                }
            } else {
                Object.keys(stats.compilation.assets).forEach((key) => {
                    gutil.log('Webpack output', c.green(key));
                });

                if (done) {
                    done();
                }
            }

            resolve();
        });
    });
};

gulp.task('clean-bundle', () => {
    return gulp.src('./src/js/bundle/*.bundle.js')
        .pipe(clean({force: true}))
        .on('end', () => { gutil.log(c.red('Bundle folder cleared')); });
});

gulp.task('webpack', (done) => {
    onBuild(done);
});

gulp.task('watch', () => {
    gulp.watch('./src/css/**/*.less', gulp.series('less'));
    gulp.watch(['./src/js/**/*.js', '!./src/js/bundle/*.js'], gulp.series('clean-bundle', 'webpack'));
});

gulp.task('default', gulp.series('less', 'clean-bundle', 'webpack', 'watch'));
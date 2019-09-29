var gulp = require('gulp');
var fileinclude  = require('gulp-file-include');
var del = require('del');
var cache = require('gulp-cache');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
var timestamp = (new Date()).getTime();

sass.compiler = require('node-sass');

gulp.task('clean', function(){
    return del.sync(['dest/**/*' ]);
});

gulp.task('fileinclude', function() {
    gulp.src(['src/*.html'])
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            context: {
                time:timestamp
            },
        }))
        .pipe(gulp.dest('./dest'));
});


gulp.task('copy',function() {
    return gulp.src('src/lib/**/*')
        .pipe(gulp.dest('./dest/lib'))
});

gulp.task('copy:ico',function() {
    return gulp.src('src/*.ico')
        .pipe(gulp.dest('./dest'))
});

gulp.task('sass', function () {
    return gulp.src('./sass/main/**/*.scss')
    .pipe(plumber())
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
      .pipe(sass.sync().on('error', sass.logError))
    .pipe(sass())
      .pipe(cleanCSS())
      .pipe(gulp.dest('dest/lib/css'));
  });

// Images   gulp images
gulp.task('testImagemin', function() {
    return gulp.src('src/lib/images/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ], {
            verbose: true
        }))
        .pipe(gulp.dest('dest/lib/images'))
});

gulp.task('task-name', function() {
    runSequence(['sass','fileinclude','copy','copy:ico']);
});

// Watchers
gulp.task('watch', function() {
    return gulp.watch([
        'src/**/*.html',
        'src/**/*.htm',
        'src/lib/**',
        'sass/**/*.scss',
    ],['task-name']);
});


//gulp images
gulp.task('default', ['task-name','watch']);
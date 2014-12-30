var gulp = require('gulp');
var del = require('del');

var jade = require('gulp-jade');
var sass = require('gulp-sass');
var concat = require('gulp-concat');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');

var gulpif = require('gulp-if');
var connect = require('gulp-connect');

//
// locals
var env = process.env.NODE_ENV || 'development';
var output = './build/dev';
var locals = {
    title : "Gulp-Jade test"
};

//
// jade templates
gulp.task('templates', function(){
    return gulp.src('./src/tpl/**/*.jade')
        .pipe(jade(
            {
                locals : locals
            }
        ))
        .pipe(gulp.dest(output))
        .pipe(connect.reload());
});

//
// browserify process
gulp.task('js', function(){
    return browserify('./src/js/main',
            {
                debug : env === 'development'
            }
        )
        .bundle()
        .pipe(source('bundle.js'))
        .pipe(gulpif(env === 'production', streamify(uglify())))
        .pipe(gulp.dest(output + '/js'))
        .pipe(connect.reload());
});

//
// sass
gulp.task('sass', function(){

    var config = {};

    if(env === 'development'){
        config.sourceComments = 'map';
    }

    if(env === 'production'){
        config.outputStyle = 'compressed';
    }

    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass(config))
        .pipe(concat('main.css'))
        .pipe(gulp.dest(output + '/css'))
        .pipe(connect.reload());
});

//
// livereload
gulp.task('connect', ['clean'], function(){
    connect.server({
        root: output,
        port: 8888,
        livereload: true
    })
});

//
// cleanup
gulp.task('clean', function(){
    del([output + '/js/**', output + '/css/**', output + '/*.html']);
});

//
// default
gulp.task('default', ['connect', 'templates', 'js', 'sass'], function(){
    gulp.watch('./src/tpl/**/*.jade', ['templates']);
    gulp.watch('./src/js/**/*.js', ['js']);
    gulp.watch('./src/sass/**/*.scss', ['sass']);
});

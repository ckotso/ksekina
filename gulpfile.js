var gulp = require('gulp');
var gutil = require('gulp-util');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');

var coffee = require('gulp-coffee');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var tplCache = require('gulp-angular-templatecache');
var ngClassify = require('gulp-ng-classify');
var ngAnnotate = require('gulp-ng-annotate');

var concat = require('gulp-concat');
var rev = require('gulp-rev');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var prettify = require('gulp-prettify');
var imagemin = require('gulp-imagemin');
var pngcrush = require('imagemin-pngcrush');

gulp.task('appJS', function() {
	// concatenate compiled .coffee files and js files
	// into build/app.js
	gulp.src([
		'!./app/**/*_test.coffee', 
		'./app/**/*.coffee',
		'!./app/**/*_test.js', 
		'./app/**/*.js'
	]).pipe(gulpif(/[.]coffee$/, ngClassify().on('error', gutil.log)))
		.pipe(gulpif(/[.]coffee$/, coffee().on('error', gutil.log)))
		.pipe(concat('app.js')).pipe(gulp.dest('./build'))
});

gulp.task('testJS', function() {
	// Compile JS test files. Not compiled.
	gulp.src([
		'./app/**/*_test.js', 
		'./app/**/*_test.coffee'
	]).pipe(gulpif(/[.]coffee$/, coffee().on('error', gutil.log)))
		.pipe(ngAnnotate())
		.pipe(gulp.dest('./build'))
});

gulp.task('templates', function() {
	// combine compiled Jade and html template files into
	// build/template.js
	gulp.src([
		'!./app/index.jade', 
		'!./app.index.html', 
		'./app/**/*.html', 
		'./app/**/*.jade'
	]).pipe(gulpif(/[.]jade$/, jade().on('error', gutil.log))).pipe(tplCache('templates.js', {
		standalone : true
	})).pipe(gulp.dest('./build'))
});

gulp.task('appCSS', function() {
	// concatenate compiled Stylus and CSS
	// into build/app.css
	gulp.src([
		'./app/**/*.styl', 
		'./app/**/*.css'
	]).pipe(gulpif(/[.]styl$/, stylus().on('error', gutil.log)))
		.pipe(concat('app.css')).pipe(gulp.dest('./build'))
});

gulp.task('appImages', function () {
    // Some SVG images where being destroyed, so skip them
    gulp.src(['!./app/images/*.svg', './app/images/*'])
        .pipe(imagemin({
            progressive: true,
            use: [pngcrush()]
        }).on('error', gutil.log))
        .pipe(gulp.dest('./build/images'));

   // Just copy them to the images directory
    gulp.src('./app/images/*.svg')
    	.pipe(gulp.dest('./build/images'));
});

gulp.task('libJS', function() {
	// concatenate vendor JS into build/lib.js
	gulp.src([
		'./bower_components/modernizr/modernizr.js', 
		'./bower_components/jquery/dist/jquery.js', 
		'./bower_components/bootstrap/dist/js/bootstrap.js', 
		'./bower_components/angular/angular.js', 
		'./bower_components/angular-cookies/angular-cookies.js', 
		'./bower_components/angular-sanitize/angular-sanitize.js', 
		'./bower_components/angular-touch/angular-touch.js', 
		'./bower_components/angular-animate/angular-animate.js', 
		'./bower_components/angular-ui-router/release/angular-ui-router.js'
	]).pipe(concat('lib.js')).pipe(gulp.dest('./build'));
});

gulp.task('libShimJS', function() {
	// concatenate vendor JS into build/oldieshim.js
	gulp.src([
		'./bower_components/es5-shim/es5-shim.js', 
		'./bower_components/json3/lib/json3.min.js'
	]).pipe(concat('oldieshim.js')).pipe(gulp.dest('./build'));
});

gulp.task('libCSS', function() {
	// concatenate vendor css into build/lib.css
	gulp.src([
		'./bower_components/bootstrap/dist/css/bootstrap.css'
	]).pipe(concat('lib.css')).pipe(gulp.dest('./build'));
});

gulp.task('index', function() {
	gulp.src([
		'./app/index.jade', 
		'./app/index.html'
	]).pipe(gulpif(/[.]jade$/, jade().on('error', gutil.log)))
		.pipe(prettify({indent_size: 4})).pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
	// reload connect server on built file change
	gulp.watch(['build/*.html', 'build/*.js', 'build/*.css', 'build/images/*'], function(event) {
		return gulp.src(event.path).pipe(connect.reload());
	});

	// watch files to build
	gulp.watch(['./app/**/*.coffee', '!./app/**/*_test.coffee', './app/**/*.js', '!./app/**/*_test.js'], ['appJS']);
	gulp.watch(['./app/**/*_test.coffee', './app/**/*_test.js'], ['testJS']);
	gulp.watch(['!./app/index.jade', '!./app/index.html', './app/**/*.jade', './app/**/*.html'], ['templates']);
	gulp.watch(['./app/**/*.styl', './app/**/*.css'], ['appCSS']);
	gulp.watch(['./app/images/*'], ['appImages']);
	gulp.watch(['./app/index.jade', './app/index.html'], ['index']);
});


gulp.task('connect', connect.server({
	root : ['build'],
	port : 8080,
	livereload : true
}));

gulp.task('default', ['connect', 'appJS', 'testJS', 'templates', 'appCSS', 'appImages', 'index', 'libJS', 'libShimJS', 'libCSS', 'watch']);

gulp.task('dist', ['appJS', 'testJS', 'templates', 'appCSS', 'appImages', 'index', 'libJS', 'libShimJS', 'libCSS'], function() {
  gulp.src('./build/index.html')
    .pipe(usemin({
      css: [minifyCss(), 'concat', rev()],
      html: [minifyHtml({conditionals: true, empty: true, comments: true})],
      js: [uglify(), rev()]
    }))
    .pipe(gulp.dest('dist/'));

  gulp.src('./build/images/*')
  	.pipe(gulp.dest('dist/images'));
});

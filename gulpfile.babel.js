import gulp from 'gulp';
import concat from 'gulp-concat';
import wrap from 'gulp-wrap';
import uglify from 'gulp-uglify';
import htmlmin from 'gulp-htmlmin';
import gulpif from 'gulp-if';
import sass from 'gulp-sass';
import yargs from 'yargs';
import ngAnnotate from 'gulp-ng-annotate';
import templateCache from 'gulp-angular-templatecache';
import server from 'browser-sync';
import del from 'del';
import path from 'path';
import imagemin from 'gulp-imagemin';
import child from 'child_process';
import sourcemaps from 'gulp-sourcemaps';
import nodemon from 'gulp-nodemon';
import autoprefix from 'gulp-autoprefixer';

const exec = child.exec;
const argv = yargs.argv;
const root = 'app/';
const port = process.env.PORT || '7203';
const paths = {
  dist: './dist/',
  scripts: [`${root}/src/js/**/*.js`, `!${root}/src/js/**/*.spec.js`],
  tests: `${root}/src/**/*.spec.js`,
  styles: `${root}/sass/*.scss`,
  server: `${root}server/`,
  templates: `${root}/src/js/**/*.html`,
  modules: [
    'angular/angular.js',
    'angular-aria/angular-aria.js',
    'angular-ui-router/release/angular-ui-router.js',
    'angular-loading-bar/build/loading-bar.min.js',
    'angular-animate/angular-animate.js',
    'angular-sanitize/angular-sanitize.js',
    'angular-material/angular-material.js'
  ],
    static: [
      `${root}/index.html`,
      `${root}/assets/fonts/**/*`,
      `${root}/assets/images/**/*`,
      `${root}/assets/svg/**/*`
    ]
};

const scss = {
  sassOpts: {
    outputStyle: 'nested',
    precison: 3,
    errLogToConsole: true,
    includePaths: ['./app/src/sass/']
  }
};

server.create();

gulp.task('clean', cb => del(paths.dist + '**/*', cb));

gulp.task('templates', () => {
  return gulp.src(paths.templates)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(templateCache({
      root: 'app',
      standalone: true,
      transformUrl: function (url) {
        return url.replace(path.dirname(url), '.');
      }
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('modules', ['templates'], () => {
  return gulp.src(paths.modules.map(item => 'node_modules/' + item))
  .pipe(concat('vendor.js'))
  .pipe(gulpif(argv.deploy, uglify()))
  .pipe(gulp.dest(paths.dist + 'js/'));
});

gulp.task('vendor-styles', () => {
  return gulp.src([
    './node_modules/angular-material/angular-material.css'
  ])
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefix())
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest(paths.dist + 'css/'));
});

gulp.task('styles', ['vendor-styles'], () => {
  return gulp.src(paths.styles)
    .pipe(autoprefix())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest(paths.dist + 'css/'));
});

gulp.task('scripts', ['modules'], () => {
  return gulp.src([
`!${root}/src/js/**/*.spec.js`,
 `${root}/src/js/**/*.module.js`,
...paths.scripts,
  './templates.js'
])
.pipe(sourcemaps.init())
  .pipe(wrap('(function(angular){\n\'use strict\';\n<%= contents %>})(window.angular);'))
  .pipe(concat('bundle.js'))
  .pipe(ngAnnotate())
  .pipe(gulpif(argv.deploy, uglify()))
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(paths.dist + 'js/'));
});

gulp.task('serve', () => {
  return server.init({
    files: [`${paths.dist}/**`],
    port: 4000,
    server: {
      baseDir: paths.dist
    }
  });
 });

 gulp.task('copy', ['clean'], () => {
  return gulp.src(paths.static, { base: 'app' })
    .pipe(gulp.dest(paths.dist));
});

 gulp.task('watch', ['serve', 'scripts'], () => {
  gulp.watch([paths.scripts, paths.templates], ['scripts']);
  gulp.watch(paths.styles, ['styles']);
});

 gulp.task('firebase', ['styles', 'scripts'], cb => {
  return exec('firebase deploy', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

 gulp.task('default', [
 'copy',
 'styles',
 'serve',
 'watch'
 ]);

gulp.task('dev', [
  'copy',
  'styles',
  'watch-dev'
]);

gulp.task('watch-dev', ['scripts'], () => {
  gulp.watch([paths.scripts, paths.templates], ['scripts']);
  gulp.watch(paths.styles, ['styles']);
});

 gulp.task('production', [
   'copy',
   'styles',
   'scripts'
 ]);

gulp.task('serve-dev', ['dev'], () => {
  var isDev = true;
  var options = {
    script: `${paths.server}app.js`,
    delayTime: 1,
    env: {
      'PORT': port,
      'NODE_ENV': isDev ? 'dev' : 'build'
    },
    watch: [paths.server]
  };

  return nodemon(options);

});

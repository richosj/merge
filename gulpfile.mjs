import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as sass from 'sass';
import gulpSass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import postCss from 'gulp-postcss';
import rename from 'gulp-rename';
import browserSync from 'browser-sync';
import concat from 'gulp-concat';
import fileInclude from 'gulp-file-include';
import cssnano from 'cssnano';
import cached from 'gulp-cached';
import { deleteSync } from 'del';
import cleanCss from 'gulp-clean-css';
import babel from 'gulp-babel';

const sassCompiler = gulpSass(sass);
const server = browserSync.create();

const paths = {
  includeHtml: 'src/html/include/**/*.html',
  html: 'src/html/**/*.html',
  scss: 'src/assets/css',
  js: 'src/assets/js/**/*.js',
  vendorJs: 'src/assets/js/vendor/**',
  images: 'src/assets/images/**/*',
  fonts: 'src/assets/fonts/**/*',  // 폰트 경로 추가
  dist: 'dist',
  distCss: 'dist/assets/css',
  distJs: 'dist/assets/js',
  distVendorJs: 'dist/assets/js/vendor',
  distImages: 'dist/assets/images',
  distFonts: 'dist/assets/fonts',  // 배포 폰트 경로 추가
};


// Clean task
function clean() {
  return new Promise((resolve) => {
    deleteSync([paths.dist]);
    resolve();
  });
}

// HTML task
function html() {
  return gulp.src([paths.html, `!${paths.includeHtml}`])
    .pipe(plumber())
    .pipe(fileInclude({ 
      prefix: '@@', 
      basepath: '@file', 
      context: {
        page_main: false,
        page_name: null,
        page__name: null,
        title: null,
        menuTitle: null
      } 
    })) 
    .pipe(cached('html'))
    .pipe(gulp.dest(paths.dist))
    .pipe(server.stream());
}

// SCSS task
function styles() {
  return gulp.src(`${paths.scss}/index.scss`, { allowEmpty: true })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(postCss([autoprefixer()]))  // cssnano() 제거
    .pipe(rename('styles.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distCss))
    .pipe(server.stream());
}

// Minified CSS task
function minifyStyles() {
  return gulp.src(`${paths.scss}/index.scss`, { allowEmpty: true })  // 경로 변경
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(postCss([autoprefixer(), cssnano()]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distCss))
    .pipe(server.stream());
}


// CSS Reset task
function cssReset() {
  return gulp.src(`${paths.scss}/reset.scss`, { allowEmpty: true })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sassCompiler().on('error', sassCompiler.logError))
    .pipe(postCss([autoprefixer(), cssnano()]))
    .pipe(rename('reset.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distCss));
}

// Minified CSS Reset task
function minifyCssReset() {
  return gulp.src(`${paths.distCss}/reset.css`, { allowEmpty: true })
    .pipe(cleanCss())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.distCss));
}

const separateFiles = [
  'src/assets/js/main.js'
];
// JavaScript task
function scripts() {
  return gulp.src([paths.js, 
    `!${paths.vendorJs}`,
    ...separateFiles.map(file => `!${file}`)
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.distJs))
    .pipe(rename('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.distJs))
    .pipe(server.stream());
}

// Separate files task
function createSeparateTasks() {
  return separateFiles.map(file => {
    const taskName = `script-${file.split('/').pop().replace('.js', '')}`;
    gulp.task(taskName, () => {
      return gulp.src(file)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(rename(file.split('/').pop()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.distJs))
        .pipe(server.stream());
    });
    return taskName;
  });
}

// Vendor JavaScript task
function vendors() {
  return gulp.src(paths.vendorJs)
    .pipe(gulp.dest(paths.distVendorJs));
}

// Images task
function images() {
  return gulp.src(paths.images)
    .pipe(gulp.dest(paths.distImages));
}

// Fonts task
function fonts() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest(paths.distFonts));
}

// BrowserSync task
function serve(done) {
  server.init({
    server: {
      baseDir: paths.dist
    }
  });

  gulp.watch(paths.html, gulp.series(html, (done) => { server.reload(); done(); }));
  gulp.watch(`${paths.scss}/**/*.scss`, gulp.series(styles, minifyStyles));
  gulp.watch(paths.js, scripts);
  gulp.watch(paths.vendorJs, vendors);
  gulp.watch(paths.images, images);
  gulp.watch(paths.fonts, fonts); // 폰트 경로 감시 추가
  done();
}

// Initial build task
const initialBuild = gulp.series(cssReset, minifyCssReset);

// Build task
const build = gulp.series(clean, initialBuild, gulp.parallel(html, gulp.series(styles, minifyStyles), vendors, scripts, gulp.parallel(createSeparateTasks()), images, fonts)); // 폰트 작업 추가

// Default task
export default gulp.series(build, serve);

export { clean };
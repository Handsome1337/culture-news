"use strict";

const gulp = require("gulp");

const htmlmin = require("gulp-htmlmin");

const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");

const server = require("browser-sync").create();

const uglify = require("gulp-uglify");
const concat = require("gulp-concat");

const imagemin = require("gulp-imagemin");

const del = require("del");

gulp.task("html", () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

gulp.task("css", () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", () => {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css"));
  gulp.watch("source/*.html").on("change", gulp.series("html", "refresh"));
});

gulp.task("refresh", (done) => {
  server.reload();
  done();
});

gulp.task("js", () => {
  return gulp.src(["source/js/*.js", "node_modules/picturefill/dist/picturefill.js"])
    .pipe(concat("main.js"))
    .pipe(uglify())
    .pipe(gulp.dest("build/js"));
});

gulp.task("images", () => {
  return gulp.src("source/img/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("copy", () => {
  return gulp.src("source/fonts/**/*.{woff,woff2}", {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", () => del("build"));

gulp.task("build", gulp.series("clean", "html", "copy", "css", "images", "js"));
gulp.task("start", gulp.series("build", "server"));

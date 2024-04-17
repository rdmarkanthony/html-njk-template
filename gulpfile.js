const gulp = require("gulp");
const sass = require("gulp-sass")(require("node-sass"));
const header = require("gulp-header");
const htmlbeautify = require("gulp-html-beautify");
const argv = require("yargs").argv;
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");

// load all required plugins (listed in package.json)
const plugins = require("gulp-load-plugins")({
  pattern: "*",
});

console.log(plugins); // logs loaded plugins in terminal

const reload = (after) => {
  plugins.browserSync.reload();
  after();
};

// loads browsersync
gulp.task("browser-sync", (after) => {
  plugins.browserSync.init({
    server: {
      baseDir: "./public",
      middleware: function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        next();
      },
    },
  });
  after();
});

// renders nunjucks
gulp.task("njk", () => {
  // Gets .html and .njk files in pages
  return (
    gulp
      .src("./pages/**/**/*.+(html|njk)")
      .pipe(
        plugins.nunjucksRender({
          path: ["./templates"],
        })
      )
      .on("error", function (err) {
        console.log(err.message); //don't output error for now
        console.log(err.fileName); //don't output error for now
        this.emit("end");
      })
      .pipe(
        htmlbeautify({
          preserve_newlines: false,
        })
      )
      // output files in app folder
      .pipe(gulp.dest("./public"))
  );
});

// compile scss
gulp.task("styles", () => {
  return (
    gulp
      .src(["./assets/scss/**/*.scss", "!./assets/scss/fontawesome/**/*.scss"])
      .pipe(header("$folder: '../fonts';\n"))
      .pipe(
        sass({
          outputStyle: "compressed",
        }).on("error", sass.logError)
      )
      // .pipe(
      //   plugins.autoprefixer({
      //     overrideBrowserslist: ["last 3 versions"],
      //     cascade: false,
      //   })
      // )
      .pipe(postcss([tailwindcss, autoprefixer]))
      .pipe(gulp.dest("./public/assets/css/"))
  );
});

// compile js
gulp.task("scripts", () => {
  return gulp
    .src([
      // libraries
      "./assets/js/lib/jquery.min.js",
      "./assets/js/lib/jquery.inview.min.js",

      // custom
      "./assets/js/custom.js",
    ])
    .pipe(plugins.concat("custom.js"))
    .pipe(gulp.dest("./public/assets/js/"));
});

// linters
gulp.task("lint-styles", () => {
  return gulp
    .src(["./assets/scss/**/*.scss", "!assets/scss/vendor/**/*.scss"])
    .pipe(plugins.sassLint())
    .pipe(plugins.sassLint.format())
    .pipe(plugins.sassLint.failOnError());
});

gulp.task("lint-scripts", () => {
  return gulp
    .src(["./assets/js/**/*.js", "!node_modules/**"])
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

// merge and minify files
gulp.task("concat-styles", () => {
  return (
    gulp
      .src(["./assets/scss/**/*.scss", "!./assets/scss/fontawesome/**/*.scss"])
      .pipe(header("$folder: '../fonts';\n"))
      .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
      .pipe(
        plugins.autoprefixer({
          overrideBrowserslist: ["last 3 versions"],
          cascade: false,
        })
      )
      .pipe(gulp.dest("./public/assets/css/"))
      .pipe(
        plugins.rename({
          suffix: ".min",
        })
      )
      // .pipe(plugins.sourcemaps.write())
      .pipe(gulp.dest("./public/assets/css/"))
  );
});

gulp.task("concat-scripts", () => {
  return (
    gulp
      .src(["./public/assets/js/custom.js"])
      .pipe(plugins.concat("custom.js"))
      .pipe(plugins.uglify())
      .on("error", function (err) {
        console.log(err);
      })
      .pipe(
        plugins.rename({
          suffix: ".min",
        })
      )
      // .pipe(plugins.sourcemaps.write())
      .pipe(gulp.dest("./public/assets/js"))
  );
});

// gulp watch
gulp.task(
  "watch",
  gulp.series("njk", "styles", "scripts", "browser-sync", () => {
    // watch njk files
    gulp.watch(
      ["./pages/**/*.+(html|njk)", "./templates/**/*.+(html|njk)"],
      gulp.series("njk", "styles", reload)
    );

    // watch sass files
    gulp.watch(["./assets/scss/**/*.scss"], gulp.series("styles", reload));

    // watch js files
    gulp.watch(["./assets/js/*.js"], gulp.series("scripts", "styles", reload));
  })
);

gulp.task("lint", gulp.series("lint-styles", "lint-scripts")); // lint css + js files
gulp.task("merge", gulp.series("concat-styles", "concat-scripts")); // merge & minify css + js
gulp.task("build", gulp.series("njk", "styles", "scripts", "merge")); // default gulp task that runs all build tasks

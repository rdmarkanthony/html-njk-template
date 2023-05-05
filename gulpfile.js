const gulp = require("gulp");
const sass = require('gulp-sass');
const header = require('gulp-header');
const htmlbeautify = require('gulp-html-beautify');
const argv = require('yargs').argv;

// Load all required plugins (listed in package.json)
const plugins = require("gulp-load-plugins")({
    pattern: "*"
});

console.log(plugins); // Logs loaded plugins in terminal

const reload = plugins.browserSync.reload;

// Loads BrowserSync
gulp.task("browser-sync", () => {
    plugins.browserSync.init({
        server: {
            baseDir: "./public",
            routes: {
                // "/students": "./public/students.html",
            },
            middleware: function (req, res, next) {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
            }
        }
    });
});

// Renders Nunjucks
gulp.task("njk-boilerplate", () => {
    // Gets .html and .njk files in pages
    return gulp
        .src("./pages/**/**/*.+(html|njk)")
        // Adding data to Nunjucks
        // .pipe(
        //   plugins.data(() => {
        //     return require("./app/data.json");
        //   })
        // )
        // Renders template with nunjucks
        .pipe(
            plugins.nunjucksRender({
                path: ["./templates"]
            })
        )
        .on('error', function (err) {
            console.log(err.message); //don't output error for now
            console.log(err.fileName); //don't output error for now
            this.emit('end');
        })
        .pipe(htmlbeautify({
            preserve_newlines: false
        }))
        // output files in app folder
        .pipe(gulp.dest("./public"))
});
gulp.task("njk", ["njk-boilerplate"]);

// Compile Sass
gulp.task("styles-boilerplate", () => {
    return gulp
        .src(["./assets/scss/**/*.scss", "!./assets/scss/fontawesome/**/*.scss"])
        .pipe(
            header("$folder: '../fonts';\n"))
        .pipe(
            sass({
                outputStyle: 'compressed'
            }).on('error', sass.logError))
        .pipe(
            plugins.autoprefixer({
                browsers: ["last 3 versions"],
                cascade: false
            })
        )
        .pipe(gulp.dest("./public/assets/css/"))
});

gulp.task("styles", ["styles-boilerplate"]);

// Compile JS
gulp.task("scripts-boilerplate", () => {
    var g = gulp
        .src([
            // libraries
            "./assets/js/lib/jquery.min.js",

            // custom
            "./assets/js/custom.js"
        ])
        .pipe(plugins.concat("custom.js"))
        .pipe(gulp.dest("./public/assets/js/"));
});

gulp.task("scripts", ["scripts-boilerplate"]);

// Linters
gulp.task("lint-styles", () =>
    gulp
    .src(["./assets/scss/**/*.scss", "!assets/scss/vendor/**/*.scss"])
    .pipe(plugins.sassLint())
    .pipe(plugins.sassLint.format())
    .pipe(plugins.sassLint.failOnError())
);

gulp.task("lint-scripts", () => {
    gulp
        .src(["./assets/js/**/*.js", "!node_modules/**"])
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format())
        .pipe(plugins.eslint.failAfterError());
});

// Merge and minify files
gulp.task("concat-styles", () => {
    return gulp
      .src(["./assets/scss/**/*.scss", "!./assets/scss/fontawesome/**/*.scss"])
      .pipe(
        header("$folder: '../fonts';\n"))
      .pipe(
        sass({ outputStyle: 'compressed' }).on('error', sass.logError))
      .pipe(
        plugins.autoprefixer({
          browsers: ["last 3 versions"],
          cascade: false
        })
      )
      .pipe(gulp.dest("./public/assets/css/"))
      .pipe(
        plugins.rename({
          suffix: ".min"
        })
      )
      .pipe(plugins.sourcemaps.write())
      .pipe(gulp.dest("./public/assets/css/"));
  });

gulp.task("concat-js", () => {
    gulp
        .src(["./public/assets/js/custom.js"])
        .pipe(plugins.concat("custom.js"))
        .pipe(plugins.uglify())
        .on('error', function (err) {
            console.log(err)
        })
        .pipe(
            plugins.rename({
                suffix: ".min"
            })
        )
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest("./public/assets/js"));
});

// Gulp tasks
gulp.task("watch", ["njk", "styles", "scripts", "browser-sync"], () => {
    // Watch sass files
    gulp.watch([
        "./assets/scss/**/*.scss",
    ], ["styles", reload]);

    // Watch js files
    gulp.watch([
        "./assets/js/*.js",
    ], ["scripts", reload]);

    // Watch njk files
    gulp.watch(
        [
            "./pages/**/*.+(html|njk)",
            "./templates/**/*.+(html|njk)",
        ], ["njk", reload]
    );
});

gulp.task("build", ["styles", "merge"]); // Compile sass, concat and minify css + js
gulp.task("default", ["watch"]); // Default gulp task
gulp.task("lint", ["lint-styles", "lint-scripts"]); // Lint css + js files
gulp.task("merge", ["concat-styles", "concat-js"]); // Merge & minify css + js
gulp.task("build2", ["njk", "styles", "scripts"]);
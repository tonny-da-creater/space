let project_folder = "dist";
let source_folder = "src";

let fs = require('fs');


let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/img/",
        fonts: project_folder + "/fonts/",
        // sprites: project_folder + "/iconsprite/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: source_folder + "/fonts/*.ttf",
        // sprites: source_folder + "/iconsprite/**/*.svg",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        // sprites: source_folder + "/iconsprite/*.svg",
    },
    clean: "./" + project_folder + "/"
}

let {
    src,
    dest,
    parallel,
    series
} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    grop_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpcss = require('gulp-webp-css'),
    svgSprite = require('gulp-svg-sprite'),
    ttf2woff = require('gulp-ttf2woff'),
    ttf2woff2 = require('gulp-ttf2woff2'),
    fonter = require("gulp-fonter"),
    concat = require('gulp-concat'),
    jquery = require('jquery'),
    fancy = require('fancybox'),
    sourcemaps = require("gulp-sourcemaps");

function browserSync() {
    browsersync.init({
        server: {
            baseDir: "dist/"
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src([
        path.src.css
    ])
        .pipe(sourcemaps.init())
        .pipe(
            scss({
                outputStyle: "expanded",
                errorLogToConsole: true
            })
        )
        .on('error', console.error.bind(console))
        .pipe(
            grop_media()
        )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 10 version"],
                cascade: true,
                grid: true
            })
        )
        .pipe(webpcss({ webpClass: '.webp', noWebpClass: '.no-webp' }))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function js() {
    return src([
        'src/libs/jquery.js',
        'src/libs/jquery.fancybox.min.js',
        'src/libs/slick.min.js',
        path.src.js
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .on('error', console.error.bind(console))
        .pipe(sourcemaps.write('./'))
        .pipe(dest(path.build.js))
        // .pipe(browsersync.stream())
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    src(path.src.fonts)
        .pipe(ttf2woff())
        .pipe(dest(path.build.fonts));
    return src(path.src.fonts)
        .pipe(ttf2woff2())
        .pipe(dest(path.build.fonts));
}

gulp.task("otf2ttf", function () {
    return src([source_folder + '/fonts/*.otf'])
        .pipe(fonter({
            formats: ["ttf"]
        }))
        .pipe(dest(source_folder + "/fonts/"));
})

function svg_sprite() {
    return src([source_folder + '/iconsprite/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../icons/icons.svg",
                    example: true
                }
            },
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fontsStyle(params) {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}
function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.img], images)
    gulp.watch([path.watch.img], svg_sprite)
}

function clean() {
    return del(path.clean);
}

gulp.task('default', gulp.series(clean, gulp.parallel(css, html, js, images, watchFiles, svg_sprite, fonts, fontsStyle, browserSync)));

// let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle);
// let watch = gulp.parallel(build, watchFiles, browserSync);

// exports.fontsStyle = fontsStyle;
// exports.fonts = fonts;
// exports.images = images;
// exports.js = js;
// exports.css = css;
// exports.html = html;
// exports.build = build;
// exports.watch = watch;
// exports.default = watch;

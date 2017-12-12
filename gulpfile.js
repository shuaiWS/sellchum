var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var inject = require('gulp-inject');
var processhtml = require('gulp-processhtml');

var distPath = './dist/';

var filesToMove = [
    './src/css/*.css',
    './src/img/**/*',
    './src/config.public.js',
];

gulp.task('move', function () {
    return gulp.src(filesToMove, { base: 'src' })
        .pipe(gulp.dest(distPath));
});

gulp.task('concat-uglify-lib', function () {
    return gulp
        .src(["./lib/drunk.js", "./lib/application.js", "./lib/drunk.waterfall.js", "./lib/drunk.carousel.js", "./lib/cookies.js"])
        .pipe(concat('lib.js'))
        .pipe(uglify())
        .pipe(gulp.dest(distPath + 'js/'));
});

gulp.task('uglify-app', function () {
    return gulp
        .src("./src/app.js")
        .pipe(uglify())
        .pipe(gulp.dest(distPath + 'js/'));
});

gulp.task('inject-tpl-process-index', function () {
    return gulp
        .src('./src/index.html')
        .pipe(inject(gulp.src(['./src/pages/**/*.html']), {
            starttag: '<!-- inject:tpl:{{ext}} -->',
            transform: function (filePath, file) {
                // return file contents as string 
                return [
                    '\n<script type="text/html" id="', filePath.slice(filePath.indexOf('pages')), '">\n',
                    file.contents.toString('utf8'),
                    '\n</script>'
                ].join('');
            }
        }))
        .pipe(processhtml())
        .pipe(gulp.dest(distPath));
});

gulp.task('default', function () {
    gulp.start(
        'move',
        'concat-uglify-lib',
        'uglify-app',
        'inject-tpl-process-index'
    );
});

gulp.task('online', function () {
    gulp.start(
        'move',
        'concat-uglify-lib',
        'uglify-app',
        'inject-tpl-process-index'
    );
});

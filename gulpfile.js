const gulp = require("gulp");
const rename = require("gulp-rename");
const sequence = require("gulp-sequence");
const ts = require("@notadd/gulp-typescript");

const packages = {
    "upyun": ts.createProject("src/tsconfig.json"),
};

const dist = "package";
const source = "src";

const modules = Object.keys(packages);

gulp.task("default", function () {
    tasks();
});

modules.forEach(module => {
    gulp.task(module, () => {
        return packages[module]
            .src()
            .pipe(packages[module]())
            .pipe(gulp.dest(dist));
    });
});

gulp.task("build", function (cb) {
    sequence("upyun", modules.filter((module) => module !== "upyun"), cb);
});

function tasks() {
    modules.forEach(module => {
        watchGraphql(source, module);
        watchTypescript(source, module);
    });
}

function watchGraphql(source, module) {
    gulp.watch(
        [
            `${source}/${module}/**/*.graphql`,
            `${source}/${module}/*.graphql`,
        ],
        [
            module,
        ]
    ).on("change", function (event) {
        console.log("File " + event.path + " was " + event.type + ", running tasks...");
        gulp.src([
            `${source}/${module}/**/*.graphql`,
            `${source}/${module}/*.graphql`,
        ]).pipe(rename(function (path) {
            path.basename = path.basename.replace(".original", ".types");
        })).pipe(gulp.dest(`${dist}/${module}`));
    });
}

function watchTypescript(source, module) {
    gulp.watch(
        [
            `${source}/${module}/**/*.ts`,
            `${source}/${module}/**/*.tsx`,
            `${source}/${module}/*.ts`,
            `${source}/${module}/*.tsx`,
        ],
        [
            module,
        ]
    ).on("change", function (event) {
        console.log("File " + event.path + " was " + event.type + ", running tasks...");
    });
}

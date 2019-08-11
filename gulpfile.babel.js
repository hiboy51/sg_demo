import minimist from "minimist";
import csv2json from "./plugins/csv2json";
import gulp from "gulp";
import fs from "fs"
import path from "path";
const $ = require("gulp-load-plugins")() ;

const args = minimist(process.argv.slice(2));
gulp.task('csv2json', function() {
    let f = args.file;
    let ext = args.ext || ".csv";
    let dest = args.dest;
    if (!f) {
        throw new Error("must specify a csv file or a dir");
    }

    let status = fs.statSync(f);
    if (status.isDirectory()) {
        f = path.join(f, `**/*${ext}`);
    }

    return gulp.src(f)
      .pipe(csv2json())
      .pipe($.rename({extname: ".json"}))
      .pipe(gulp.dest(dest|| (file => file.base)));
});
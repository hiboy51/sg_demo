import through from "through2"
export default function csv2json() {
    return through.obj(function (file, encode, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            this.push(file);
            return callback();
        }

        let content = String(file.contents);
        let lines = content.split("\r\n")
            .filter((each, idx) => each != "" && idx != 0);

        let [title, ...datas] = lines;
        let titles = title.split(",");

        let jsonFile = datas.map(each => {
            let d = each.split(",");
            let r = d.reduce((pre, cur, idx) => {
                let k = String(titles[idx]);
                pre[k] = cur;
                return pre;
            }, {});
            return r;
        });

        let jsonContens = JSON.stringify(jsonFile, null, "\t");
        file.contents = Buffer.from(jsonContens, "utf-8");
        this.push(file);
        callback();
    });
}
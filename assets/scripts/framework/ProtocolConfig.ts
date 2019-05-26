declare function require(moduleName: string): any;

/** 协议注册文件 */
const CONFIG_FILES = [
    "ProtocolConfig"
];

const COMMANDS = function(){
    let all = [];
    let conf;
    CONFIG_FILES.forEach(file => {
        conf = require(file);
        conf && all.push(conf);
    });
    return all;
}();

export const getProtocolIdByKey = function(key:string) {
    for (let i in COMMANDS) {
        let conf = COMMANDS[i];
        for (let k in conf) {
            if (k == key) {
                return conf[k];
            }
            if (key == conf[k]) {
                return key;
            }
        }
    }
    return null;
}

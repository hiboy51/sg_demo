
function same_as(key: string) {
    return (constructor, name) => {
        let dic = constructor.same_as_dic;
        dic[name] = key;
    }
}

export default class Define {
    @same_as("BBB")
    public static AAA = "123";
    @same_as("CCC")
    public static BBB = "321";
    public static CCC= "11111";

    public static same_as_dic = {};

    public static find_root_key(key: string){
        let dic = Define.same_as_dic;
        let same_as = dic[key];
        if (!same_as) {
            return key;
        }
        return Define.find_root_key(same_as);
    }
}

let key = Define.find_root_key("AAA");
console.log(key, Define[key]);

import BulletPool from "./BulletPool";
import Bullet from "./Bullet";
import LockStepSystem from "./LockStepSystem";

export const FRAME_RATE = 50;
export const FRAME_INTERVAL = 0.02;
const {ccclass, property} = cc._decorator;

export let DEBUG = true;
export function SGLog(...msg) : void {
    if (DEBUG) {
        cc.log(msg);
    }
}

/**
*随机函数
*
* @param {number} [max=1]
* @param {number} [min=0]
* @returns
* @memberof CyEngine
*/
export function SeededRandom(max = 1, min = 0) {
    // this.seed = 55;
    // this.seed = (this.seed * 9301 + 49297) % 233280;
    // let rnd = this.seed / 233280.0;
    // return min + rnd * (max - min);

    return min + Math.random() * (max - min);
}

@ccclass
export default class SGInit extends cc.Component {
    static instance: SGInit = null;

    private _bulletPool: BulletPool = null;
    get bulletPool():BulletPool {
        return this._bulletPool;
    }
    set bulletPool(bp: BulletPool) {
        this._bulletPool = bp;
    }

    private _urlParams: any = {};
    get urlParams() {
        return this._urlParams;
    }

    private _lsSystem: LockStepSystem = null;
    get lsSystem() {
        return this._lsSystem;
    }
    set lsSystem(sys: LockStepSystem) {
        this._lsSystem = sys;
    }

    @property(cc.Prefab)
    pref_board: cc.Prefab = null;

    onLoad() {
        this.parseURLParams();

        SGInit.instance = this;
        
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;

        let board = cc.instantiate(this.pref_board);
        board.parent = this.node;
    }

    private parseURLParams() {
        let params: Array<any> = window.location.search.substr(1).split("&").map(each => each.split("="));
        params.forEach(each => {
            let [name, val] = each;
            this._urlParams[name] = val;
        })
    }
}
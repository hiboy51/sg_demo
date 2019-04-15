import BulletPool from "./BulletPool";
import Bullet from "./Bullet";

export const FRAME_RATE = 50;
const {ccclass, property} = cc._decorator;

export let DEBUG = true;
export function SGLog(...msg) : void {
    if (DEBUG) {
        cc.log(msg);
    }
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

    @property(cc.Prefab)
    pref_board: cc.Prefab = null;

    onLoad() {
        SGInit.instance = this;
        
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;

        let board = cc.instantiate(this.pref_board);
        board.parent = this.node;
    }
}
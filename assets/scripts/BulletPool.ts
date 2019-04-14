import SGInit from "./SGInit";
import Bullet from "./Bullet";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletPool extends cc.Component {
    @property({
        displayName: "子弹预制体",
        type: cc.Prefab
    })
    prefab_bullet: cc.Prefab = null;

    _pool:cc.Node[] = [];

    onLoad() {
        this.initPool();
    }

    start() {
        let init = SGInit.instance;
        init.bulletPool = this;
    }

    public spawnBullet() {
        if (this._pool.length == 0) {
            this.expandPool();
        }

        let spawn = this._pool.pop();
        let bullet = spawn.getComponent("Bullet");
        bullet && bullet.onReady();

        return spawn;
    }

    public recycleBullet(b: cc.Node) {
        if (b.group != "bullet") {
            return;
        }

        let bullet = b.getComponent("Bullet") as Bullet;
        bullet && bullet.onRecycle();
        this._pool.push(b);
    }

    private initPool() {
        this.expandPool(10);
    }


    private expandPool(count: number = 5) {
        for (let i = 0; i < count; ++i) {
            let nd = cc.instantiate(this.prefab_bullet);
            this._pool.push(nd);
        }
    }

}
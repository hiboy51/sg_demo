import BulletPool from "./BulletPool";
import SGInit from "./SGInit";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property({
        displayName: "子弹对象池",
        type: BulletPool
    })
    bulletPool: BulletPool = null;

    @property
    fly_speed: number = 50;
    
    @property
    rotate_speed: number = 30;

    _animation: cc.Animation = null;
    _rb: cc.RigidBody = null;

    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
        this._rb = this.node.getComponent(cc.RigidBody);
    
        this.bulletPool = SGInit.instance.bulletPool;

        this._waitActive = false;
    }

    start() {
        if (this._waitActive) {
            this._waitActive = false;
            this._rb.angularVelocity = this.rotate_speed;
        }
    }


    onEndContact(contact, selfCollider, otherCollider) {
        this._animation.play("bullet_boom");
    }

    public fly(v: cc.Vec2) {
        this._rb.linearVelocity = v;
    }

    // ================================================================================
    // bullet pool callback
    // ================================================================================
    _waitActive: boolean = true;
    public onReady() {
        if (!this._waitActive) {
            this._rb.angularVelocity = this.rotate_speed;
        }
    }
    
    public onRecycle() {
        this._rb.linearVelocity = cc.Vec2.ZERO;
        this._rb.angularVelocity = 0;
    }

    // ================================================================================
    // animation callback
    // ================================================================================
    anim_boom_end() {
        this.node.parent = null;
        this.bulletPool.recycleBullet(this.node);
    }
}
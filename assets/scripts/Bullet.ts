import BulletPool from "./BulletPool";
import SGInit, { FRAME_RATE } from "./SGInit";
import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {
    @property({
        displayName: "子弹对象池",
        type: BulletPool
    })
    bulletPool: BulletPool = null;

    @property
    fly_speed: number = 100;

    @property
    rotate_speed: number = 100;

    @property({
        displayName: "子弹初始化图片",
        type: cc.SpriteFrame
    })
    spf_init:cc.SpriteFrame = null;

    @property({
        displayName: "子弹sprite",
        type: cc.Sprite
    })
    sp_bullet: cc.Sprite = null;

    private _animation: cc.Animation = null;
    private fly_dir: cc.Vec2 = null;

    private _running: boolean = false;
    private _ownerId: number = null;
    get ownerId() {
        return this._ownerId;
    }
    set ownerId(id: number) {
        this._ownerId = id;
    }

    private _waitActive: boolean = true;

    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
        this.bulletPool = SGInit.instance.bulletPool;

        if (this._waitActive) {
            this._waitActive = false;
        }
    }

    lateUpdate() {
        if (this._running) {
            let add = this.fly_dir.normalizeSelf().mulSelf(this.fly_speed / FRAME_RATE);
            this.node.position = this.node.position.addSelf(add);
    
            this.node.rotation += this.rotate_speed / FRAME_RATE;
        }
    }
    
    onCollisionEnter(other, self) {
        if (other.node.group == "player") {
            let player = other.node.getComponent("Player") as Player;
            if (player.playerId == this.ownerId) {
                return;
            }
        }
        this._running = false;
        this._animation.play("bullet_boom");
    }

    public fly(v: cc.Vec2) {
        this.fly_dir = v;
        this._running = true;
    }

    // ================================================================================
    // bullet pool callback
    // ================================================================================
    public onReady() {
        if (!this._waitActive) {
            this.sp_bullet.spriteFrame = this.spf_init;
        }
    }
    
    public onRecycle() {
        this.sp_bullet.spriteFrame = this.spf_init;
        this._running = false;
        this.fly_dir = null;
        this.node.rotation = 0;
        this.node.position = cc.Vec2.ZERO;
    }

    // ================================================================================
    // animation callback
    // ================================================================================
    anim_boom_end() {
        this.node.parent = null;
        this.bulletPool.recycleBullet(this.node);
    }
}
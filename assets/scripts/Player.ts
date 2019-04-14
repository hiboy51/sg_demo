import { FRAME_RATE } from "./SGInit";

const {ccclass, property} = cc._decorator;

export enum AvatarAnim {
    "idle",
    "wark",
    "aim"
}

@ccclass
export default class Player extends cc.Component {
    @property({
        displayName: "方向箭头",
        type: cc.Node
    })
    spr_direction: cc.Node = null;

    @property({
        displayName: "Avatar",
        type: cc.Node
    })
    spr_avatar: cc.Node = null;

    @property({
        displayName: "面向角度"
    })
    face_angle: number = 0;

    @property({
        displayName: "面向方向"
    })
    face_dir: cc.Vec2 = cc.Vec2.RIGHT;

    @property
    wark_speed: number = 50;

    @property
    near_check: number = 20;

    private _animation: cc.Animation = null;
    private _forward: boolean = false;
    private _isBlock: boolean = false;
    private _aimPoint: cc.Vec2 = null;
    private _aimCallBack: Function = null;

    private _playerId: number = 1;
    get playerId() {
        return this._playerId;
    }

    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
    }

    lateUpdate() {
        if (this._forward && !this._isBlock) {
            let sub = this._aimPoint.sub(this.node.position);
            if (sub.mag() > this.near_check) {
                this.updateDirection(sub);
                let add = sub.normalizeSelf().mulSelf(this.wark_speed / FRAME_RATE)
                this.node.position = this.node.position.addSelf(add);
            }
        }
    }

    onCollisionEnter(other, self) {
        if (other.node.group == "bullet") {
            // 游戏结束
        }
        else if (other.node.group == "edges") {
            this._isBlock = true;
        }
    }

    onCollisionExit(other, self) {
        if (other.node.group == "edges") {
            this._isBlock = false;
        }
    }

    public playAnimation(anim: AvatarAnim, cb?: Function) {
        this._aimCallBack = null;
        if (anim == AvatarAnim.idle) {
            let as = this._animation.getAnimationState("avatar_idle");
            if (!as || !as.isPlaying) {
                this._animation.play("avatar_idle");
            }
        }
        else if (anim == AvatarAnim.wark) {
            let as = this._animation.getAnimationState("avatar_walk");
            if (!as || !as.isPlaying) {
                this._animation.play("avatar_walk");
            }
        }
        else if (anim == AvatarAnim.aim) {
            this._animation.play("avatar_aim");
            if (cb) {
                this._aimCallBack = cb;
            }
        }
    }

    public updateDirection(dir: cc.Vec2) {
        this.face_dir = dir.normalizeSelf();
        let rad = cc.Vec2.RIGHT.signAngle(dir);
        this.face_angle = cc.misc.radiansToDegrees(rad);
        this.face_angle = (this.face_angle + 360) % 360;
        this.spr_direction.setRotation(-this.face_angle);

        this.spr_avatar.setScale(this.face_angle >= 90 && this.face_angle <= 270 ? -1 : 1, 1);
    }

    public isSelf() : boolean {
        return true;
    }

    public setForward(f: boolean, aim?:cc.Vec2) {
        this._isBlock = false;
        this._forward = f;
        if (f && aim) {
            this._aimPoint = this.node.parent.convertToNodeSpaceAR(aim);
        }
    }

    // ===============================================================
    // 动画结束时回调
    // ===============================================================
    avatar_aim_end() {
        if (this._aimCallBack) {
            this._aimCallBack();
            this._aimCallBack = null;
        }
    }
}
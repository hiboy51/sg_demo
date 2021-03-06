import { FRAME_RATE } from "./SGInit";

const {ccclass, property} = cc._decorator;

export enum AvatarAnim {
    "idle",
    "walk",
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
    private _aimPoint: cc.Vec2 = null;
    private _aimCallBack: Function = null;
    private _block: boolean = false;

    set forward(b: boolean) {
        this._forward = b;
    }
    get forward() {
        return this._forward;
    }
    get aimPoint() {
        return this._aimPoint;
    }

    set block(b: boolean) {
        this._block = b;
    }
    get block() {
        return this._block;
    }

    private _playerId: string = "";
    get playerId() {
        return this._playerId;
    }
    set playerId(id: string) {
        this._playerId = id;
    }

    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
    }

    public playAnimation(anim: AvatarAnim, cb?: Function) {
        this._aimCallBack = null;
        if (anim == AvatarAnim.idle) {
            let as = this._animation.getAnimationState("avatar_idle");
            if (!as || !as.isPlaying) {
                this._animation.play("avatar_idle");
            }
        }
        else if (anim == AvatarAnim.walk) {
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
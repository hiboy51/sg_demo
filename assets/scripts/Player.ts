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
    wark_speed: number = 10;

    @property
    near_check: number = 20;

    private _animation: cc.Animation = null;
    private _forward: boolean = false;
    private _isBlock: boolean = false;
    private _aimPoint: cc.Vec2 = null;
    private _aimCallBack: Function = null;
    private _rb: cc.RigidBody = null;

    onLoad() {
        this._animation = this.node.getComponent(cc.Animation);
        this._rb = this.node.getComponent(cc.RigidBody);
    }

    update() {
        if (this._forward) {
            if (this._isBlock) {
                this._rb.linearVelocity = cc.Vec2.ZERO;
            }
            else {
                let sub = this._aimPoint.sub(this.node.position);
                if (sub.mag() > this.near_check) {
                    this.updateDirection(sub);
                    this._rb.linearVelocity = sub.normalizeSelf().mulSelf(this.wark_speed);
                }
            }
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.group == "bullet") {
            // 游戏结束
        }
        else if (otherCollider.node.group == "edges") {
            this._isBlock = true;
        }
    }

    onEndContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.group == "edges") {
            this._isBlock = false;
        }
    }

    public playAnimation(anim: AvatarAnim, cb?: Function) {
        this._animation.stop();
        if (anim == AvatarAnim.idle) {
            this._animation.play("avatar_idle");
        }
        else if (anim == AvatarAnim.wark) {
            this._animation.play("avatar_wark");
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
        let rad = cc.Vec2.RIGHT.angle(dir);
        this.face_angle = cc.misc.radiansToDegrees(rad);
        this.spr_direction.setRotation(this.face_angle);

        this.spr_avatar.setScale(this.face_angle >= -90 && this.face_angle <= 90 ? 1 : -1, 1);
    }

    public isSelf() : boolean {
        return true;
    }

    public setForward(f: boolean, aim?:cc.Vec2) {
        this._forward = f;
        if (f && aim) {
            this._aimPoint = this.node.convertToNodeSpaceAR(aim);
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
import Player, { AvatarAnim } from "./Player";
import {UserInput} from "./UserInput";
import BulletPool from "./BulletPool";
import Bullet from "./Bullet";
import SGInit, { FRAME_RATE } from "./SGInit";
import { MachineState, RESULT_CALLBACK, StateMachine } from "./StateMachine";
const {ccclass, property} = cc._decorator;

// ===============================================================================
// 状态机
// ===============================================================================

enum PlayerStateFlag {
    "idle",
    "walk",
    "shoot"
}

export class PlayerState implements MachineState {
    protected _machine: StateMachine;
    protected _state: PlayerStateFlag;
    protected _player: Player;
    constructor(p: Player, machine: StateMachine) {
        this._player = p;
        this._machine = machine;
    }
    get player() {
        return this._player;
    }
    get state() {
        return this._state;
    }
    get machine() {
        return this._machine;
    }

    onEnterState(pre: MachineState): void {
        throw new Error("Method not implemented.");
    }
    onExitState(next: MachineState, succ: RESULT_CALLBACK): void {
        throw new Error("Method not implemented.");
    }
}

export class PlayerIdle extends PlayerState {
    constructor(p: Player, machine: StateMachine) {
        super(p, machine);
        this._state = PlayerStateFlag.idle;
    }

    onEnterState(pre: MachineState) {
        this.player.playAnimation(AvatarAnim.idle);
    }

    onExitState(next: MachineState, succ: RESULT_CALLBACK) {
        succ(true);
    }
}

export class PlayerWalk extends PlayerState {
    constructor(p: Player, machine: StateMachine) {
        super(p, machine);
        this._state = PlayerStateFlag.walk;
    }

    onEnterState(pre: MachineState) {
        this.player.playAnimation(AvatarAnim.walk);
    }

    onExitState(next: MachineState, succ: RESULT_CALLBACK) {
        succ(true);
    }
}

export class PlayerShoot extends PlayerState {
    private _preState: MachineState;
    private _stateEnd: boolean = false;

    constructor(p: Player, machine: StateMachine) {
        super(p, machine);
        this._state = PlayerStateFlag.shoot;
    }

    onEnterState(pre: MachineState) {
        this._preState = pre;
        this._stateEnd = false;
        this.player.playAnimation(AvatarAnim.aim, () => {
            this._stateEnd = true;
            (this.machine as PlayerController).playerShoot();
            this.machine.changeState(this._preState);
        });
    }

    onExitState(next: MachineState, succ: RESULT_CALLBACK) {
        succ(this._stateEnd);
    }
}

// ===============================================================================
// ===============================================================================

@ccclass
export default class PlayerController extends cc.Component implements StateMachine {
    @property({
        displayName: "子弹对象池",
        type: BulletPool
    })
    bullet_pool: BulletPool = null;

    @property({
        type: Player
    })
    player: Player = null;
    _inputQueue: UserInput[] = [];

    onLoad() {
        this.bullet_pool = SGInit.instance.bulletPool;
    }

    start() {
        this.changeState(new PlayerIdle(this.player, this));
    }

    lateUpdate() {
        let p = this.player;
        if (p.forward && !p.block) {
            let sub = p.aimPoint.sub(this.node.position);
            if (sub.mag() > p.near_check) {
                p.updateDirection(sub);
                let add = sub.normalizeSelf().mulSelf(p.wark_speed / FRAME_RATE)
                this.node.position = this.node.position.addSelf(add);
            }
            else {
                p.forward = false;
            }
        }
        else {
            this.playerStandBy();
        }
    }

    onCollisionEnter(other, self) {
        if (other.node.group == "bullet") {
            // 游戏结束
        }
        else if (other.node.group == "edges") {
            this.player.block = true;
            let world = self.world;
            let preAabb = world.preAabb as cc.Rect;
            let prePos = preAabb.center;
            this.node.position = this.node.parent.convertToNodeSpaceAR(prePos);
        }
    }

    onCollisionStay(other, self) {
        if (other.node.group == "edges") {
            this.player.block = true;
        }
    }

    onCollisionExit(other, self) {
        if (other.node.group == "edges") {
            this.player.block = false;
        }
    }

    // =============================================================================

    public appendInput(ip: UserInput) {
        if (this.player.isSelf()) {
            this._inputQueue.push(ip);
        }
    }
    
    public setPlayer(p: Player) {
        this.player = p;
    }
    
    public onFrame(input: UserInput) {
        input.apply(this);
    }

    public playerForward(aim: cc.Vec2) {
        this.player.setForward(true, aim);
        this.changeState(new PlayerWalk(this.player, this));
    }

    public playerStandBy() {
        this.player.setForward(false);
        this.changeState(new PlayerIdle(this.player, this));
    }

    public playerStartShoot() {
        this.changeState(new PlayerShoot(this.player, this));
    }

    _shootTimer: number = undefined;
    public playerMutiShoot() {
        this._shootTimer = setInterval(() => {
            this.playerShoot();
        }, 200);
    }
    
    public playerStopShoot() {
        if (this._shootTimer !== undefined) {
            clearInterval(this._shootTimer);
        }
    }

    public playerShoot() {
        let bullet = this.bullet_pool.spawnBullet();
        bullet.position = this.player.node.position;
        bullet.parent = this.player.node.parent;
        let comp_bullet:Bullet = bullet.getComponent("Bullet");
        comp_bullet.ownerId = this.player.playerId;
        comp_bullet.fly(this.player.face_dir.mulSelf(comp_bullet.fly_speed));
    }

    // =================================================================
    // override from StateMachine
    // =================================================================
    private _curPlayerState: MachineState = null;
    changeState(st: MachineState) {
        if (this._curPlayerState) {
            this._curPlayerState.onExitState(st, succ => {
                if (succ) {
                    st.onEnterState(this._curPlayerState);
                    this._curPlayerState = st;
                }
            });
        }
        else {
            st.onEnterState(null);
            this._curPlayerState = st;
        }
    }
}
import { MachineState, RESULT_CALLBACK, StateMachine } from "./StateMachine";
import PlayerController, { PlayerIdle, PlayerWalk, PlayerState, PlayerStateFlag } from "./PlayerController";
import { FRAME_RATE, FRAME_INTERVAL } from "./SGInit";
import LockStepSystem from "./LockStepSystem";

const {ccclass, property} = cc._decorator;

export enum AIStates {
    "idle",
    "wander",
    "shoot",
    "die"
}

export abstract class AIMachineState implements MachineState {
    protected _flag: AIStates;
    get flag(){
        return this._flag;
    }
    
    protected _frameElapse: number = 0;
    protected _playerCtrl: PlayerController;
    protected _machine: StateMachine;

    constructor(pc: PlayerController, machine: StateMachine) {
        this._playerCtrl = pc;
        this._machine = machine;
    }

    public onFrame() {
        ++this._frameElapse;
    }

    onEnterState(pre: MachineState): void {
        throw new Error("Method not implemented.");
    } 

    onExitState(next: MachineState, succ: RESULT_CALLBACK): void {
        throw new Error("Method not implemented.");
    }

    protected _nextState() {
        let rand = LockStepSystem.SeededRandom(100, 0);
        if (rand < 20) {
            return new AIIdle(this._playerCtrl, this._machine);
        }
        if (rand < 70) {
            return new AIFight(this._playerCtrl, this._machine);
        }

        if (this._playerCtrl.player.block) {
            return this._nextState();
        }
        return new AIWander(this._playerCtrl, this._machine);
    }
}

export class AIIdle extends AIMachineState {
    private _sustain: number;

    constructor(pc: PlayerController, machine: StateMachine) {
        super(pc, machine);
        this._flag = AIStates.idle;
    }

    onEnterState(pre: MachineState): void {
        this._sustain = LockStepSystem.SeededRandom( FRAME_RATE, FRAME_RATE * 0.5);
        this._playerCtrl.playerStandBy();
    } 

    onExitState(next: MachineState, succ: RESULT_CALLBACK): void {
        succ(true);
    }

    onFrame() {
        super.onFrame();
        if (this._frameElapse > this._sustain) {
            this._machine.changeState(this._nextState());
        }
    }
}

export class AIWander extends AIMachineState {
    private _sustain: number;
    private _aimPoint: cc.Vec2;

    constructor(pc: PlayerController, machine: StateMachine){
        super(pc, machine);
        this._flag = AIStates.wander;
    }

    onFrame() {
        super.onFrame();
        if (this._playerCtrl.player.block) {
            this._machine.changeState(new AIWander(this._playerCtrl, this._machine));
            return;
        }

        if (this._frameElapse > this._sustain) {
            this._machine.changeState(this._nextState());
            return;
        }
    }

    onEnterState(pre: MachineState): void {
        this._sustain = LockStepSystem.SeededRandom(FRAME_RATE * 3, FRAME_RATE * 0.5);
        this._aimPoint = this._aimPoint || this.genAim();
        
        this._playerCtrl.playerForward(this._aimPoint);
    } 

    onExitState(next: MachineState, succ: RESULT_CALLBACK): void {
        succ(true);
    }

    private genAim() {
        let x = cc.winSize.width * LockStepSystem.SeededRandom(1, 0);
        let y = cc.winSize.height * LockStepSystem.SeededRandom(1, 0);
        return new cc.Vec2(x, y);
    }
}

export class AIFight extends AIMachineState {
    private _stateEnd: boolean = false;
    private _overtime: number = 10 * FRAME_RATE;
    private _preState: MachineState = null;

    constructor(pc: PlayerController, machine: StateMachine) {
        super(pc, machine);
        this._flag = AIStates.shoot;
    }

    onFrame() {
        super.onFrame();
        if ((this._playerCtrl.curPlayerState as PlayerState).state != PlayerStateFlag.shoot || this._frameElapse > this._overtime) {
            this._stateEnd = true;

            let rand = LockStepSystem.SeededRandom(100, 0);
            let changeState = rand < 50 ? this._preState : this._nextState();
            this._machine.changeState(changeState);
        }
    }

    onEnterState(pre: MachineState): void {
        this._preState = pre;
        this._stateEnd = false;
        this._playerCtrl.playerStartShoot();
    } 

    onExitState(next: MachineState, succ: RESULT_CALLBACK): void {
        succ(this._stateEnd);
    }
}

@ccclass
export default class AIPlayer extends cc.Component implements StateMachine {
    private _curPlayerState: MachineState = null;

    changeState(st: MachineState): void {
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

    start() {
        let pc = this.node.getComponent("PlayerController");
        this.changeState(new AIIdle(pc, this));
    }

    update(dt) {
        (this._curPlayerState as AIMachineState).onFrame();
    }

}
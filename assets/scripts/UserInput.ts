import PlayerController from "./PlayerController";

const {ccclass, property} = cc._decorator;

export abstract class UserInput {
    public abstract apply(pc: PlayerController): void;

    public abstract serialize() : string;
}

// =================================================================================
// =================================================================================

export class Forward extends UserInput {
    private _aimPoint: cc.Vec2 = null;

    constructor(aim: cc.Vec2) {
        super();
        this._aimPoint = aim;
    }

    public apply(pc:PlayerController) {
        pc.playerForward(this._aimPoint);
    }

    public serialize() : string {
        return "";
    }
}

// =================================================================================
// =================================================================================

export class ShootOnce extends UserInput {
    public apply(pc:PlayerController) {
        pc.playerStartShoot();
    }

    public serialize() : string {
        return "";
    }
}

// =================================================================================
// =================================================================================

export class ShootMuti extends UserInput {
    public apply(pc:PlayerController) {
        pc.playerMutiShoot();
    }

    public serialize() : string {
        return "";
    }
}

// =================================================================================
// =================================================================================

export class StopShoot extends UserInput {
    public apply(pc:PlayerController) {
        pc.playerStopShoot();
    }

    public serialize() : string {
        return "";
    }
}

// =================================================================================
// =================================================================================

export class StandBy extends UserInput {
    public apply(pc:PlayerController) {

    }

    public serialize() : string {
        return "";
    }
}
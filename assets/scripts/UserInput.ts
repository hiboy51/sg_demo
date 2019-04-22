import PlayerController from "./PlayerController";
import Main from "./main";
import SGInit from "./SGInit";

const {ccclass, property} = cc._decorator;
export abstract class UserInput {
    public abstract clazz(): any;
    public abstract apply(...args): void;
    public abstract serialize() : object;
}

// =================================================================================
// =================================================================================

export class Forward extends UserInput {
    private _aimPoint: cc.Vec2 = null;

    
    constructor(aim: cc.Vec2) {
        super();
        this._aimPoint = aim;
    }

    public clazz() {
        return Forward;
    }
    
    public apply(pc:PlayerController) {
        pc.playerForward(this._aimPoint);
    }
    
    public serialize() : object {
        return {t: "p", s: "fwd", d: [this._aimPoint.x, this._aimPoint.y]};
    }

    public static unSerialize(o: {d: Array<number>}) {
        let data = o.d;
        return new Forward(new cc.Vec2(data[0], data[1]));
    }
}

// =================================================================================
// =================================================================================

export class ShootOnce extends UserInput {
    public clazz() {
        return ShootOnce;
    }

    public apply(pc:PlayerController) {
        pc.playerStartShoot();
    }

    public serialize() : object {
        return {t: "p", s: "sht1"};
    }

    public static unserialize() {
        return new ShootOnce();
    }
}

// =================================================================================
// =================================================================================

export class ShootMuti extends UserInput {
    public clazz() {
        return ShootMuti;
    }

    public apply(pc:PlayerController) {
        pc.playerMutiShoot();
    }

    public serialize() : object {
        return {t: "p", s: "shtN"};
    }

    public static unserialize() {
        return new ShootMuti();
    }
}

// =================================================================================
// =================================================================================

export class StopShoot extends UserInput {
    public clazz() {
        return StopShoot;
    }

    public apply(pc:PlayerController) {
        pc.playerStopShoot();
    }

    public serialize() : object {
        return {t: "p", s: "stp"};
    }

    public static unserialize() {
        return new StopShoot();
    }
}

// =================================================================================
// =================================================================================

export class StandBy extends UserInput {
    public clazz() {
        return StandBy;
    }

    public apply(pc:PlayerController) {

    }

    public serialize() : object {
        return {};
    }
}

// =================================================================================
// =================================================================================

export class PlayerCreated extends UserInput {
    public clazz() {
        return PlayerCreated;
    }

    public apply(m: Main, playerId: string) {
        m.spawnPlayer(playerId);
    }

    public serialize() : object {
        return {t: "p", s: "born"};
    }

    public static unserialize(args: any) {
        return new PlayerCreated();
    }
}
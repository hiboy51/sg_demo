import {UserInput, Forward, ShootOnce, ShootMuti, StandBy, StopShoot} from "./UserInput";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Gestures extends cc.Component {
    private _toHandler: number = undefined;

    onLoad() {
        this.node.on(cc.Node.EventType.MOUSE_MOVE, (touch, event) => {
            let aimPoint = touch.getLocation();
            this.throwInput(new Forward(aimPoint));
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_DOWN, (touch, event) => {
            this.throwInput(new ShootOnce());
            this._toHandler = setTimeout(() => {
                this._toHandler = undefined;
                this.throwInput(new ShootMuti());
            }, 20);
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_UP, (touch, event) => {
            if (this._toHandler !== undefined) {
                clearTimeout(this._toHandler);
                this._toHandler = undefined;
            }
            this.throwInput(new StopShoot());
        }, this);

        this.node.on(cc.Node.EventType.MOUSE_LEAVE, (touch, event) => {
            this.throwInput(new StandBy());
        }, this);
    }

    public throwInput(input: UserInput) {
        this.node.emit("on_user_input", input);
    }
}
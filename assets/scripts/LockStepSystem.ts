import SGInit, { FRAME_RATE } from "./SGInit";
import { UserInput, Forward, ShootOnce, PlayerCreated, ShootMuti, StopShoot } from "./UserInput";
import Main from "./main";
import * as Colyseus from "./colyseus/colyseus.js";
import { PlayerIdle, PlayerWalk } from "./PlayerController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LockStepSystem extends cc.Component {
    _tickHandler: number = null;
    _clientFrameCache: Array<any> = [];
    _clientFrameIndex: number = 0;

    _uploadCache: Array<UserInput> = [];

    _client: any;
    _room: any;
    _connected: boolean = false;

    _sessionId: string = null;
    get sessionId() {
        return this._sessionId;
    }

    @property(Main)
    main: Main = null;

    private static RAN_SEED: number = 0;
    public static SeededRandom(max = 1, min = 0) {
        let seed = LockStepSystem.RAN_SEED;
        seed = (seed * 9301 + 49297) % 233280;
        let rnd = seed / 233280.0;
        return min + rnd * (max - min);
    }

    onLoad() {
        this._client = new Colyseus.Client('ws://localhost:2567');
        this._room = this._client.join("my_room");
        this._room.onJoin.add(() => {
            console.log(this._room.sessionId, "joined", this._room.name);
            this._sessionId = this._room.sessionId;
            this._connected = true;
        });
        this._room.onMessage.add((message: {cmd: string, body: any, seed: number, sessionId: string}) => {
            if (message.sessionId != this._room.sessionId) {
                return;
            } 

            console.log(JSON.stringify(message));

            LockStepSystem.RAN_SEED = message.seed;
            switch(message.cmd) {
                case "tick":
                    this.parseFrame(message.body);
                    break;
                case "frames":
                    let len = (message.body as Array<any>).length;
                    for (let i = 0; i < len; ++i) {
                        this.parseFrame(message.body[i]);
                    }
                    break;
                default:
            }
        });
    }

    start() {
        SGInit.instance.lsSystem = this;
        this._tickHandler = setInterval(this.tick.bind(this), 1 / FRAME_RATE);
    }

    onDestroy() {
        if (this._tickHandler) {
            clearInterval(this._tickHandler);
        }
    }

    public uploadInput(serialize: UserInput) {
        this._uploadCache.push(serialize);
    }

    private uniqueUserInuptArray(arry: UserInput[]) {
        let clss = [];
        for (let i = arry.length - 1; i >= 0; --i) {
            let each = arry[i];
            let cls = each.clazz();
            if (clss.some(t => each instanceof t)) {
                arry.splice(i);
            }
            else {
                clss.push(cls);
            }
        }
    }

    private tick() {
        if (!this._connected) {
            return;
        }

        // 上报上一帧的所有用户操作
        if (this._uploadCache.length != 0) {
            this.uniqueUserInuptArray(this._uploadCache);
            let serialzie = this._uploadCache.map(each => {
                let r = each.serialize();
                r["player"] = this.sessionId;
                return r;
            })
            this._room.send({cmd: "tick", body: serialzie, fidx: this._clientFrameIndex});
            this._uploadCache = [];
        }

        // 要严格顺序执行用户命令
        let total = this._clientFrameCache.length - 1;
        if (total > this._clientFrameIndex + 50) {
            for (let i = 0, each; i < 50; ++i) {
                each = this._clientFrameCache[this._clientFrameIndex + 1];
                this.runEachFrame(each);
                ++this._clientFrameIndex;
            }
        }
        else if (total >= this._clientFrameIndex) {
            let each;
            while(each = this._clientFrameCache[this._clientFrameIndex]) {
                this.runEachFrame(each);
                ++this._clientFrameIndex;
            }
        }
    }

    private runEachFrame(each: any) {
        if (each["type"] == "player") {
            this.main.onFrame(each);
        }
    }

    /**
     * 反序列化帧数据
     * [{t: "p", s: "fwd", d: [11, 22], player: 111}, {t:"p", s: "st", player: 222}]
     * @param data 序列化的数据
     */
    private parseFrame(data: Array<any>) {
        let msgBody = data;
        let len = data.length;
        for (let i = 0, each: {t: string, s: string}, input: any; i < len; ++i) {
            each = msgBody[i];
            input = this.genInputData(each);
            if (each.t == "p") {
                this._clientFrameCache.push({type: "player", owner: each["player"], op: input});
            }
        }
    }

    private genInputData(data: {t: string, s: string}) {
        let result: UserInput = null;
        if (data.t == "p") {
            switch(data.s) {
                case "fwd":
                    result = Forward.unSerialize(data as {t: string, s: string, d: Array<number>});
                    break;
                case "sht1":
                    result = ShootOnce.unserialize();
                    break;
                case "shtN":
                    result = ShootMuti.unserialize();
                    break;
                case "stp":
                    result = StopShoot.unserialize();
                    break;
                case "born":
                    result = PlayerCreated.unserialize(data);
                    break;
            }
        }
        return result;
    }
}
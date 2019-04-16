import SGInit, { FRAME_RATE } from "./SGInit";
import { UserInput, Forward, ShootOnce, PlayerCreated, ShootMuti, StopShoot } from "./UserInput";
import Main from "./main";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LockStepSystem extends cc.Component {
    _tickHandler: number = null;
    _clientFrameCache: Array<any> = [];
    _clientFrameIndex: number = 0;

    _uploadCache: Array<object> = [];

    @property(Main)
    main: Main = null;

    start() {
        SGInit.instance.lsSystem = this;
        this._tickHandler = setInterval(this.tick.bind(this), 1 / FRAME_RATE);
    }

    onDestroy() {
        if (this._tickHandler) {
            clearInterval(this._tickHandler);
        }
    }

    public uploadInput(serialize: object) {
        this._uploadCache.push(serialize);
    }

    private tick() {
        // 上报上一帧的所有用户操作
        if (this._uploadCache.length > 0) {
            this.parseFrame(JSON.stringify(this._uploadCache));
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
    private parseFrame(data: string) {
        let msgBody = JSON.parse(data) as Array<any>;
        let len = msgBody.length;
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
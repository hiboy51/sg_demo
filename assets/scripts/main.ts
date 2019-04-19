import PlayerController from "./PlayerController";
import { UserInput, PlayerCreated } from "./UserInput";
import LockStepSystem from "./LockStepSystem";
import SGInit from "./SGInit";
import AIPlayer from "./AIPlayer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    @property(cc.TiledObjectGroup)
    mapInfo: cc.TiledObjectGroup = null;

    @property(cc.Prefab)
    pref_player: cc.Prefab = null;

    @property(cc.Node)
    layer_players: cc.Node = null;

    playerCtrls: PlayerController[] = [];

    onLoad() {
        this.node.on("on_user_input", (ui: UserInput) => {
            let serialize = ui.serialize();
            serialize["player"] = 1;
            if (SGInit.instance && SGInit.instance.lsSystem) {
                SGInit.instance.lsSystem.uploadInput(serialize);
            }
        });
    }

    start() {
        let op = new PlayerCreated();
        let serialize = op.serialize();
        serialize["player"] = 1;

        SGInit.instance.lsSystem.uploadInput(serialize);
    }

    public onFrame(frameData: {owner: number, op: UserInput}) {
        if (frameData.op instanceof PlayerCreated) {
            frameData.op.apply(this);
        }
        else {
            let playerCtrl = this.playerCtrls.reduce((pre, cur) => {
                if (pre && pre.player.playerId == frameData.owner) {
                    cur = pre;
                }
                return cur;
            }, null);
            if (playerCtrl) {
                playerCtrl.onFrame(frameData.op);
            }
        }
    }

    public spawnPlayer() {
        let p = cc.instantiate(this.pref_player);
        p.parent = this.layer_players;

        let spawnInfo = this.mapInfo.getObject("spawn_point1");
        let spawnPos = new cc.Vec2(spawnInfo.x, spawnInfo.y);
        spawnPos = this.layer_players.convertToNodeSpaceAR(spawnPos);
        p.position = spawnPos;

        this.playerCtrls.push(p.getComponent("PlayerController"));
        p.addComponent("AIPlayer");

        return p;
    }
}
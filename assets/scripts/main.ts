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
    }
    
    start() {
        let op = new PlayerCreated();
        SGInit.instance.lsSystem.uploadInput(op);

        this.node.on("on_user_input", (ui: UserInput) => {
            if (SGInit.instance && SGInit.instance.lsSystem) {
                SGInit.instance.lsSystem.uploadInput(ui);
            }
        });
    }

    public onFrame(frameData: {owner: string, op: UserInput}) {
        if (frameData.op instanceof PlayerCreated) {
            frameData.op.apply(this, frameData.owner);
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

    public spawnPlayer(playerId: string) {

        let p = cc.instantiate(this.pref_player);
        p.parent = this.layer_players;

        let player = p.getComponent("Player");
        player.playerId = playerId;

        let spawnInfo = this.mapInfo.getObject("spawn_point1");
        let spawnPos = new cc.Vec2(spawnInfo.x, spawnInfo.y);
        spawnPos = this.layer_players.convertToNodeSpaceAR(spawnPos);
        p.position = spawnPos;

        this.playerCtrls.push(p.getComponent("PlayerController"));

        return p;
    }
}
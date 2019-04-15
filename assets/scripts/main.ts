import PlayerController from "./PlayerController";
import { UserInput } from "./UserInput";

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
            this.playerCtrls.forEach(each => {
                each.appendInput(ui);
            })
        });
    }

    start() {
        this.spawnPlayer();
    }

    update() {
        this.playerCtrls.forEach(each => {
            each.onFrame(0);
        })
    }

    private spawnPlayer() {
        let p = cc.instantiate(this.pref_player);
        p.parent = this.layer_players;

        let spawnInfo = this.mapInfo.getObject("spawn_point1");
        let spawnPos = new cc.Vec2(spawnInfo.x, spawnInfo.y);
        spawnPos = this.layer_players.convertToNodeSpaceAR(spawnPos);
        p.position = spawnPos;

        this.playerCtrls.push(p.getComponent("PlayerController"));
    }
}
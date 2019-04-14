import Player from "./Player";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    public follow(player: Player) {
        this.node.setPosition(player.node.getPosition());
    }
}
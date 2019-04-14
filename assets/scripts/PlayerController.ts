import Player, { AvatarAnim } from "./Player";
import {UserInput} from "./UserInput";
import BulletPool from "./BulletPool";
import Bullet from "./Bullet";
import SGInit from "./SGInit";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property({
        displayName: "子弹对象池",
        type: BulletPool
    })
    bullet_pool: BulletPool = null;

    @property({
        type: Player
    })
    player: Player = null;
    _inputQueue: UserInput[] = [];

    onLoad() {
        this.bullet_pool = SGInit.instance.bulletPool;
    }

    public appendInput(ip: UserInput) {
        if (this.player.isSelf()) {
            this._inputQueue.push(ip);
        }
    }
    
    public setPlayer(p: Player) {
        this.player = p;
    }
    
    public onFrame(frameIdx: number) {
        if (this._inputQueue.length == 0) {
            return;
        }

        let ip = null;
        while (ip = this._inputQueue.shift()) {
            ip.apply(this);
        }
    }

    public playerForward(aim: cc.Vec2) {
        this.player.setForward(true, aim);
        this.player.playAnimation(AvatarAnim.wark);
    }

    public playerStandBy() {
        this.player.setForward(false);
        this.player.playAnimation(AvatarAnim.idle);
    }

    public playerStartShoot() {
        this.player.playAnimation(AvatarAnim.aim, () => {
            this.playerShoot();
        });
    }

    _shootTimer: number = undefined;
    public playerMutiShoot() {
        this._shootTimer = setInterval(() => {
            this.playerShoot();
        }, 200);
    }
    
    public playerStopShoot() {
        if (this._shootTimer !== undefined) {
            clearInterval(this._shootTimer);
        }
    }

    private playerShoot() {
        let bullet = this.bullet_pool.spawnBullet();
        bullet.position = this.player.node.position;
        bullet.parent = this.player.node.parent;
        let comp_bullet:Bullet = bullet.getComponent("Bullet");
        comp_bullet.fly(this.player.face_dir.mulSelf(comp_bullet.fly_speed));
    }
}
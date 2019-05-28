import PopupManager from "./PopupManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupBase extends cc.Component {
    @property
    popupName:string = "";

    @property({
        type: cc.Node
    })
    nd_backlayer: cc.Node = null;

    @property({
        type: cc.Node
    })
    nd_board: cc.Node = null;

    @property({
        displayName: "是否缓存（关闭时不会销毁）"
    })
    cached: boolean = false;

    // ==========================================================================================
    // public interfaces
    // ==========================================================================================

    /** virtual */
    public setData() {

    }

    /** final */
    public async dispose() {
        await this._runUIActionOut();
        this.node.parent = null;
        PopupManager.instance && PopupManager.instance.remove(this);
    }

    // ==========================================================================================
    // life-cycle
    // ==========================================================================================
    onEnable() {
       this._runUIActionIn();
    }
    
    // ==========================================================================================
    // private interfaces
    // ==========================================================================================
    /** 进场UI动画 */
    private _runUIActionIn() {
        this.nd_backlayer.opacity = 0;
        this.nd_board.y = 500;
        this.nd_backlayer.runAction(cc.fadeIn(0.5));
        this.nd_board.runAction(cc.moveTo(1.5, cc.v2(0, 0)).easing(cc.easeElasticOut(0.5)));
    }
    
    private _runUIActionOut() {
        return new Promise(resolve => {
            this.nd_backlayer.runAction(cc.fadeOut(0.5));
            this.nd_board.runAction(cc.sequence(
                cc.moveTo(0.6, cc.v2(0, 500)).easing(cc.easeBounceIn()),
                cc.callFunc(resolve)
            ));
        })
    }
}
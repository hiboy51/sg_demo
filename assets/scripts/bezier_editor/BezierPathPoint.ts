import BezierEditor from "./BezierEditor";

const {ccclass, property, executeInEditMode} = cc._decorator;

export enum PointType {
    Path,
    Control
}

@ccclass
@executeInEditMode
export default class BezierPoint extends cc.Component {
    private _editor: BezierEditor = null;

    public set editor(e: BezierEditor) {
        this._editor = e;
    }
    public get editor() {
        return this._editor;
    }

    private _type: PointType = PointType.Path;

    public set pointType(t: PointType) {
        this._type = t;
    }

    public get pointType() {
        return this._type;
    }

    // ==========================================================================================
    // life cycle
    // ==========================================================================================
    onLoad() {
        if (CC_EDITOR) {
            this.node.on(cc.Node.EventType.POSITION_CHANGED, () => {
                this.editor && this.editor.onPointMovedInEdit(this);
            });
        }
    } 
    
    // ==========================================================================================
    // hooks of GestureRecognizer
    // ==========================================================================================
    
    public onDragging(target: cc.Node, startPos: cc.Vec2, curPos: cc.Vec2, delta: cc.Vec2) {
        this.editor && this.editor.onPathPointDragging(this, curPos);
    }

    public onDragEnd(target: cc.Node, startPos: cc.Vec2, endPos: cc.Vec2) {
        this.editor && this.editor.onPathPointDragEnd(this, endPos);
    }

    public onDoubleClicked(target: cc.Node, clickPos: cc.Vec2) {
        this.editor && this.editor.onPathPointRemove(this);
    }
}
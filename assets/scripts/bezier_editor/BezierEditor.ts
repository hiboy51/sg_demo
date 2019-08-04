import BezierPoint, { PointType } from "./BezierPathPoint";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass("BezierSerialize")
export class BezierSerialize {
    @property(cc.Vec2)
    start: cc.Vec2 = cc.v2(0, 0);

    @property(cc.Vec2)
    end: cc.Vec2 = cc.v2(0, 0);

    @property([cc.Vec2])
    ctrls: cc.Vec2[] = [];
}

export class BezierNode {
    public point: BezierPoint = null;
    public ctrl: BezierPoint = null;
}

export type Bezier = [BezierNode, BezierNode];

@ccclass
@executeInEditMode
export default class BezierEditor extends cc.Component {
    @property(cc.Prefab)
    pref_point: cc.Prefab = null;

    @property(cc.Graphics)
    comp_graphic: cc.Graphics = null;

    @property([BezierSerialize])
    bezier_serialized: BezierSerialize[] = [];

    private _isDirty = true;
    private _paths: BezierPoint[] = [];
    private _bezierNodes: BezierNode[] = [];
    private _bezier_list: Bezier[] = [];

    // ==========================================================================================
    // life cycle
    // ==========================================================================================
    
    onLoad() {
        let childCount = this.node.childrenCount;
        for (let i = childCount - 1; i >= 0; --i) {
            let isPoint = this.node.children[i].getComponent(BezierPoint);
            if (isPoint) {
                this.node.children.splice(i, 1);
            }
        }

        this._unserializeBezier();
        this._isDirty = true;

        if (CC_EDITOR) {
            this.node.on(cc.Node.EventType.CHILD_REMOVED, (child: cc.Node) => {
                let comp_point = child.getComponent(BezierPoint);
                if (comp_point) {
                    this._pointRemoved(comp_point);
                }
            });

            this.node.on(cc.Node.EventType.CHILD_ADDED, (child: cc.Node) => {
                let comp_point = child.getComponent(BezierPoint);
                comp_point.editor = this;
                if (comp_point.pointType == PointType.Path) {
                    this._appendBezierNode(comp_point);
                    this._paths.push(comp_point);
                }
                else {
                    this._attachToBezierNode(comp_point);
                }
                this._isDirty = true;
            });
        }
    }

    update() {

        if (!this._isDirty) {
            return;
        }
        this._isDirty = false;

        const c_red = cc.color(250, 42, 24);
        const c_yellow = cc.color(183, 240, 37);
        this.comp_graphic.clear();
        this._bezier_list.forEach(each => {
            let [start, end] = each;
            let [c1, c2] = each.map(e => e.ctrl);

            let startPos = this.comp_graphic.node.convertToWorldSpaceAR(start.point.node.position);
            let endPos = this.comp_graphic.node.convertToWorldSpaceAR(end.point.node.position);


            this.comp_graphic.moveTo(startPos.x, startPos.y);
            if (c1 && c2) {
                let c1Pos = this.comp_graphic.node.convertToWorldSpaceAR(c1.node.position);
                let c2Pos = this.comp_graphic.node.convertToWorldSpaceAR(c2.node.position);
                
                this.comp_graphic.strokeColor = c_yellow;
                this.comp_graphic.bezierCurveTo(
                    c1Pos.x, c1Pos.y,
                    c2Pos.x, c2Pos.y, 
                    endPos.x, endPos.y
                );
                this.comp_graphic.stroke();

                this.comp_graphic.strokeColor = c_red;
                this.comp_graphic.moveTo(startPos.x, startPos.y);
                this.comp_graphic.lineTo(c1Pos.x, c1Pos.y);
                this.comp_graphic.stroke();

                this.comp_graphic.strokeColor = c_red;
                this.comp_graphic.moveTo(endPos.x, endPos.y);
                this.comp_graphic.lineTo(c2Pos.x, c2Pos.y);
                this.comp_graphic.stroke();
            }
            else if (c1 || c2) {
                let c = c1 ? c1 : c2;
                let cPos = this.comp_graphic.node.convertToWorldSpaceAR(c.node.position);
                
                this.comp_graphic.strokeColor = c_yellow;
                this.comp_graphic.quadraticCurveTo(
                    cPos.x, cPos.y,
                    endPos.x, endPos.y
                );
                this.comp_graphic.stroke();

                this.comp_graphic.strokeColor = c_red;
                this.comp_graphic.moveTo(startPos.x, startPos.y);
                this.comp_graphic.lineTo(cPos.x, cPos.y);
                this.comp_graphic.lineTo(endPos.x, endPos.y);
                this.comp_graphic.stroke();
            }
            else {
                this.comp_graphic.strokeColor = c_yellow;
                this.comp_graphic.lineTo(endPos.x, endPos.y);
                this.comp_graphic.stroke();
            }
        });
    }

    // ==========================================================================================
    // public interfaces
    // ==========================================================================================
    
    public onPathPointDragging(point: BezierPoint, curPos: cc.Vec2) {
        point.node.position = this.node.convertToNodeSpaceAR(curPos);
        this._serializeBezier();
        this._isDirty = true;
    }

    public onPathPointDragEnd(point: BezierPoint, endPos: cc.Vec2) {
        point.node.position = this.node.convertToNodeSpaceAR(endPos);
        this._isDirty = true;
    }

    public onPathPointRemove(point: BezierPoint) {
        point.node.parent = null;
        this._pointRemoved(point);
    }

    public onPointMovedInEdit(p: BezierPoint) {
        this._isDirty = true;
        this._serializeBezier();
    }

    // ==========================================================================================
    // hooks of GestureRecognizer
    // ==========================================================================================
    
    public onDoubleClick(target: cc.Node, clickPos: cc.Vec2) {
        let pos = this.node.convertToNodeSpaceAR(clickPos);
        let comp_point = this._instantiatePoint(PointType.Path, pos);
        comp_point.node.parent = this.node;

        this._appendBezierNode(comp_point);
        this._paths.push(comp_point);
        this._isDirty = true;
    }

    public onLongTap(target: cc.Node, tapPos: cc.Vec2) {
        let pos = this.node.convertToNodeSpaceAR(tapPos);
        let comp_point = this._instantiatePoint(PointType.Control, pos);
        comp_point.node.parent = this.node;

        this._attachToBezierNode(comp_point);
        this._isDirty = true;
    }
    
    // ==========================================================================================
    // private interfaces
    // ==========================================================================================
    private _pointRemoved(p: BezierPoint) {
        if (p.pointType == PointType.Path) {
            let find = this._paths.indexOf(p);
            if (find >= 0) {
                this._paths.splice(find, 1);
                this._removeBezierNode(p);
                this._isDirty = true;
            }
        }
        else {
            let bezierNode = this._bezierNodes.find(each => each.ctrl == p);
            if (bezierNode) {
                bezierNode.ctrl = null;
                this._serializeBezier();
                this._isDirty = true;
            }
        }
    }

    private _attachToBezierNode(p: BezierPoint) {
        let tmp = this._bezierNodes
            .filter(each => !each.ctrl)
            .map(each => {
                let px = p.node.x;
                let distance = Math.abs(px - each.point.node.x);
                return {each, distance};
            })
            .sort((a, b) => a.distance - b.distance)
            .map(each => each.each);

        if (tmp) {
            let attach = tmp[0];
            attach.ctrl = p;
        }
    }

    private _updateBezierList() {
        let genBezier = (list: BezierNode[], result: Bezier[] = []) => {
            if (list.length < 2) {
                return;
            }
    
            let [start, second] = list;
            let bezier = [start, second] as Bezier;
            result.push(bezier);
            return genBezier(list.slice(2), result);
        }
        this._bezier_list = [];
        genBezier(this._bezierNodes, this._bezier_list);
        this._serializeBezier();
    }

    private _appendBezierNode(p: BezierPoint) {
        if (this._paths.length == 0) {
            return;
        }

        let start = new BezierNode();
        let end = new BezierNode();
        start.point = this._paths[this._paths.length - 1];
        end.point = p;
        this._bezierNodes = this._bezierNodes.concat([start, end]);
        this._updateBezierList();
    }

    private _removeBezierNode(point: BezierPoint) {
        if (this._bezierNodes.length == 0) {
            return;
        }

        let removeAttachedCtrl = (node: BezierNode) => {
            if (node.ctrl) {
                node.ctrl.node.parent = null;
            }
        };

        if (point.pointType == PointType.Path) {
            // head
            if (this._bezierNodes[0].point == point) {
                removeAttachedCtrl(this._bezierNodes[0]);
                removeAttachedCtrl(this._bezierNodes[1]);
                this._bezierNodes.splice(0, 2);
            }
            // tail
            else if (this._bezierNodes[this._bezierNodes.length - 1].point == point) {
                removeAttachedCtrl(this._bezierNodes.pop());
                removeAttachedCtrl(this._bezierNodes.pop());
            }
            // middle
            else {
                this._bezierNodes.forEach(each => {
                    if (each.point == point) {
                        removeAttachedCtrl(each);
                    }
                });
                this._bezierNodes = this._bezierNodes.filter(each => each.point != point);
            }
            this._updateBezierList();
        }
    }

    private _serializeBezier() {
        this.bezier_serialized = this._bezier_list.map(each => {
            let [start, end] = each;
            let serialize = new BezierSerialize();
            serialize.start = cc.v2(start.point.node.x, start.point.node.y);
            serialize.end =  cc.v2(end.point.node.x, end.point.node.y);
            serialize.ctrls = each.filter(ea => !!ea.ctrl).map(ea => cc.v2(ea.ctrl.node.x, ea.ctrl.node.y));
            return serialize;
        });
    }

    private _unserializeBezier() {
        this._paths = this.bezier_serialized
            .map(each => [each.start, each.end])
            .reduce((pre, cur) => pre.concat(cur), [])
            .filter((each, index, array) => index == array.indexOf(each))
            .map(each => this._instantiatePoint(PointType.Path, each));
        this._paths.forEach(each => each.node.parent = this.node);

        this._bezier_list = this.bezier_serialized.map(each => {
            let start = this._paths.find(e => e.node.position.equals(each.start));
            let end = this._paths.find(e => e.node.position.equals(each.end));

            let [startCtrl, endCtrl] = each.ctrls.map(e => {
                let ctrlPoint = this._instantiatePoint(PointType.Control, e);
                ctrlPoint.node.parent = this.node;
                return ctrlPoint;
            });

            let startNode = new BezierNode();
            startNode.point = start;
            startNode.ctrl = startCtrl;
            
            let endNode = new BezierNode();
            endNode.point = end;
            endNode.ctrl = endCtrl;

            return [startNode, endNode];
        });
        this._bezierNodes = this._bezier_list.reduce((pre, cur) => pre.concat(cur), []);
    }

    private _instantiatePoint(type: PointType, pos: cc.Vec2) {
        const color = type == PointType.Path ? cc.Color.WHITE : cc.Color.GRAY;
        const size = type == PointType.Path ? cc.size(20, 20) : cc.size(15, 15);

        let point = cc.instantiate(this.pref_point);
        point.position = pos;
        point.color = color;
        point.setContentSize(size);
        let comp_point = point.getComponent(BezierPoint);
        comp_point.editor = this;
        comp_point.pointType = type;
        return comp_point;
    }
}
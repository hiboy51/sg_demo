import PM from "./PopupManager";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupTest extends cc.Component {
    onEnable() {
        this.scheduleOnce(()=>{
            PM.TestPopup();
        }, 2);


        this.scheduleOnce(()=>{
            PM.$TestPopup();
        }, 5)
    }
}
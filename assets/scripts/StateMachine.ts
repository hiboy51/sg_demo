
export interface RESULT_CALLBACK {
    (b:boolean):void
}

export interface MachineState {
    onEnterState(pre: MachineState): void;
    onExitState(next:MachineState, succ: RESULT_CALLBACK): void;
}

export interface StateMachine {
    changeState(st: MachineState): void;
}
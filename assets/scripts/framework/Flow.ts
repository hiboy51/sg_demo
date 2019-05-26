export async function performWhile(doThings: ()=>any, cond: boolean | (()=>boolean)) {
    return await new Promise(resolve => {
        let handler = setInterval(() => {
            if ((typeof (cond) == "function" && cond()) || (typeof (cond) == "boolean" && cond)) {
                resolve(doThings());
                clearInterval(handler);
            }
        }, 100);
    });
}

export function performSomething(doThings: ()=>any, cond:()=>boolean, callback: ()=>any, timeout: number = 10000) {
    
}
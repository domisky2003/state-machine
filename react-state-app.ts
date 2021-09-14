

interface STATE {
    id: number,
    loading: true | false,
    fetchedtodo: { id: number },
    todo: null | { id: number }
}

interface CONTRACTSTATE {
    isprev_step_setop: boolean
    contractviolated: boolean
}
interface idobjinput { inputtype: string; value: number }
interface loadingobjinput { inputtype: string; value: true | false }
interface todoobjinput { inputtype: string; value: null | { id: number } }

type INPUT = idobjinput | loadingobjinput | todoobjinput | string;

const initialstate: STATE = {
    id: 0,
    loading: false,
    fetchedtodo: { id: 0 },
    todo: { id: 0 }
}

const initialcontractstate: CONTRACTSTATE = {
    isprev_step_setop: false,
    contractviolated: false
}

function transition(state: STATE, input: INPUT): STATE {
    var newstate: STATE = { ...state };
    var s = extractMatch(input)
    switch (s) {
        case "setid":
            if (((typeof input === "object")) && (typeof input.value === "number")) {
                newstate.id = input.value
            }
            break;
        case "useref":
            if (((typeof input === "object")) && (typeof input.value === "number")) {
                newstate.id = input.value
            }
            break;
        case "setloading":
            if (((typeof input === "object")) && (typeof input.value === "boolean")) {
                newstate.loading = input.value
            }
            break;
        case "settodo":
            newstate.todo = newstate.fetchedtodo
            break;
        case "fetchtodo":
            state.fetchedtodo.id = newstate.id
            break;
        case "render":
            break;
    }
    return newstate;
}

function transitioncontract(stateobj: STATE, contractobj: CONTRACTSTATE, input: INPUT) {
    var newcontractstate: CONTRACTSTATE = { ...contractobj }
    var nextinput = extractMatch(input)
    switch (nextinput) {
        case "setid":
            newcontractstate.contractviolated = newcontractstate.isprev_step_setop ? true : false
            newcontractstate.isprev_step_setop = true
            break;
        case "useref":
            newcontractstate.contractviolated = newcontractstate.isprev_step_setop ? true : false
            newcontractstate.isprev_step_setop = false
            break;
        case "setloading":
            newcontractstate.contractviolated = newcontractstate.isprev_step_setop ? true : false
            newcontractstate.isprev_step_setop = true
            break;
        case "settodo":
            newcontractstate.contractviolated = newcontractstate.isprev_step_setop ? true : false
            newcontractstate.isprev_step_setop = true
            break;
        case "fetchtodo":
            newcontractstate.contractviolated = newcontractstate.isprev_step_setop ? true : false
            newcontractstate.isprev_step_setop = false
            break;
        case "render":
            var invalidrender = ((stateobj.todo !== null) && (stateobj.id != stateobj.todo.id) && (stateobj.loading == false))
            newcontractstate.contractviolated = (invalidrender || !contractobj.isprev_step_setop)
            newcontractstate.isprev_step_setop = false
            break;
    }
    return newcontractstate;
}

function extractMatch(input: INPUT) {
    return (typeof input == 'object') ? input.inputtype : input;
}


function runmultipleinputs(inputArray: Array<INPUT>): boolean {
    var currentstate = initialstate;
    var currentcontractstate = initialcontractstate
    var output = false;
    for (var x = 0; x < inputArray.length; x++) {
        currentstate = transition(currentstate, inputArray[x])
        currentcontractstate = transitioncontract(currentstate, currentcontractstate, inputArray[x])
        if (currentcontractstate.contractviolated) {
            output = true;
            break;
        }
    }
    return output
}
function checkunittest(result: boolean, expected: boolean) {
    if (result == expected) {
        return true
    } else {
        console.log("unit test failed")
        return false;
    }
}
var test1 = [{ inputtype: "setid", value: 2 }]
var test2 = [{ inputtype: "setid", value: 2 },"render"]
var test3 = [{ inputtype: "useref", value: 2 }, { inputtype: "setloading", value: true }, "fetchtodo", "settodo", { inputtype: "setloading", value: false }]
var test4 = [{ inputtype: "useref", value: 2 }, { inputtype: "setloading", value: true },"render", "fetchtodo", "settodo","render", { inputtype: "setloading", value: false },"render"]
var test5 = [{ inputtype: "useref", value: 2 },"render", { inputtype: "setloading", value: true },"render", "fetchtodo", "settodo","render", { inputtype: "setloading", value: false },"render"]
var test6 = [{ inputtype: "useref", value: 2 }, { inputtype: "setloading", value: true }, { inputtype: "setid", value: 3 }, "fetchtodo", "settodo", { inputtype: "setloading", value: false }]
var test7 = [{ inputtype: "useref", value: 2 }, { inputtype: "setloading", value: true },"render", { inputtype: "setid", value: 3 },"render", "fetchtodo", "settodo", "render",{ inputtype: "setloading", value: false },"render"]
var test8 = [{ inputtype: "useref", value: 2 }, { inputtype: "setloading", value: true }, "render",{ inputtype: "setid", value: 3 },"render", { inputtype: "setloading", value: false },"render", "fetchtodo", "settodo","render"]

checkunittest(runmultipleinputs(test1), false)
checkunittest(runmultipleinputs(test2), true)
checkunittest(runmultipleinputs(test3), true)
checkunittest(runmultipleinputs(test4), false)
checkunittest(runmultipleinputs(test5), true)
checkunittest(runmultipleinputs(test6), true)
checkunittest(runmultipleinputs(test7), false)
checkunittest(runmultipleinputs(test8), true)

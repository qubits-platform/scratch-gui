const ADD_UPLOAD = "ADD_UPLOAD";
const FILE_UPLOAD = "FILE_UPLOAD";
const UPDATE_STATE_TO_ONE = "UPDATE_STATE_TO_ONE";
const UPDATE_STATE_TO_FALSE = "UPDATE_STATE_TO_FALSE";
const SET_FUNCTION = "SET_FUNCTION";

export const addupload = (todo) => ({
    type: ADD_UPLOAD,
    payload: todo,
});

export const fileupload = (files) => ({
    type: FILE_UPLOAD,
    payload: files,
});

export const updatestatetoone = (stateUp) => {
    return {
        type: UPDATE_STATE_TO_ONE,
        payload: stateUp,
    };
};

export const updatestatetofalse = (stateDown) => {
    return {
        type: UPDATE_STATE_TO_FALSE,
        payload: stateDown,
    };
};

export const setfunction = (func) => ({
    type: SET_FUNCTION,
    payload: func,
});

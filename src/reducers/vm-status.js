const SET_RUNNING_STATE = 'scratch-gui/vm-status/SET_RUNNING_STATE';
const SET_TURBO_STATE = 'scratch-gui/vm-status/SET_TURBO_STATE';
const SET_STARTED_STATE = 'scratch-gui/vm-status/SET_STARTED_STATE';
const SET_FLAG_CLICKED_STATE = 'scratch-gui/vm-status/SET_FLAG_CLICKED_STATE';
const SET_SPRITE_CLICKED_STATE = 'scratch-gui/vm-status/SET_SPRITE_CLICKED_STATE';

const initialState = {
    running: false,
    started: false,
    turbo: false,
    flagClicked: false,
    spriteClicked: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STARTED_STATE:
        return Object.assign({}, state, {
            started: action.started
        });
    case SET_RUNNING_STATE:
        return Object.assign({}, state, {
            running: action.running
        });
    case SET_TURBO_STATE:
        return Object.assign({}, state, {
            turbo: action.turbo
        });
    case SET_FLAG_CLICKED_STATE:
        return Object.assign({}, state, {
            flagClicked: action.flagClicked
        });
    case SET_SPRITE_CLICKED_STATE:
        return Object.assign({}, state, {
            spriteClicked: action.spriteClicked
        });
    default:
        return state;
    }
};

const setStartedState = function (started) {
    return {
        type: SET_STARTED_STATE,
        started: started
    };
};


const setRunningState = function (running) {
    return {
        type: SET_RUNNING_STATE,
        running: running
    };
};

const setTurboState = function (turbo) {
    return {
        type: SET_TURBO_STATE,
        turbo: turbo
    };
};

const setFlagClickedState = function (flagClicked) {
    return {
        type: SET_FLAG_CLICKED_STATE,
        flagClicked: flagClicked
    };
};

const setSpriteClickedState = function (spriteClicked) {
    return {
        type: SET_SPRITE_CLICKED_STATE,
        spriteClicked: spriteClicked
    };
};


export {
    reducer as default,
    initialState as vmStatusInitialState,
    setRunningState,
    setStartedState,
    setTurboState,
    setFlagClickedState,
    setSpriteClickedState
};

'use strict';

const LEVELS = {
    EVERYTHING: 0,
    DEBUG: 1,
    REGULAR: 2,
    ERROR: 3
};

const log = (message, options = {}) => {
    console.log(message);
};

module.exports = {
    log,
    levels: LEVELS
};

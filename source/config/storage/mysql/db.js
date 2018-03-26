'use strict';

const fsx = require('fs-extra');
const path = require('path');
const { log, levels } = require('../../../logger');

const Sequelize = require('sequelize');
const dbConfig = require('./config');

const sequelize = new Sequelize(dbConfig.dbName, dbConfig.username, dbConfig.password, {
    host: dbConfig.hostname,
    port: 3306,
    dialect: 'mysql',
    logging: false
});

let exportedFunctions = {};

async function init() {
    try {
        const modelsDir = path.join(__dirname, 'models');
        const files = await fsx.readdir(modelsDir);
        files.forEach(async (f) => {
            const model = f.split('.')[0];
            const loadedModel = require(path.join(modelsDir, model));
            const loadedModelMethods = await loadedModel.load(sequelize);
            exportedFunctions = { ...exportedFunctions, ...loadedModelMethods };
        });
        await sequelize.sync();
    } catch (err) {
        log(err.message, levels.ERROR);
    }

    return exportedFunctions;
}

module.exports = init;

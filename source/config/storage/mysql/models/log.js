'use strict';

const Sequelize = require('sequelize');
const { log, levels } = require('../../../../logger');

let Log;

module.exports = {
    load: (sequelize) => {
        Log = sequelize.define('log', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            timestamp: Sequelize.DATE,
            message: Sequelize.STRING,
        });

        return {
            getAllLogs: async () => {
                try {
                    const markets = await Log.all();
                    return markets;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            },

            add: async (name) => {
                try {
                    const market = await Log.findOrCreate({
                        where: {
                            name
                        },
                        defaults: {
                            name
                        }
                    });

                    return market;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            }
        };
    },
};

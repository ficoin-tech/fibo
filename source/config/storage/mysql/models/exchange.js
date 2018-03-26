'use strict';

const Sequelize = require('sequelize');
const { log, levels } = require('../../../../logger');

let Exchange;

module.exports = {
    load: (sequelize) => {
        Exchange = sequelize.define('exchange', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: Sequelize.STRING,
            apiKey: Sequelize.STRING,
            apiSecret: Sequelize.STRING,
            taxForSelling: Sequelize.STRING,
            taxForBuying: Sequelize.STRING,
        });

        return {
            getExchanges: async () => {
                try {
                    const exchanges = await Exchange.all();
                    return exchanges;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            },

            addExchange: async (options) => {
                try {
                    const exchange = await Exchange.findOrCreate({
                        where: {
                            name: options.name
                        },
                        defaults: options
                    });

                    return exchange;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            }
        };
    },
};

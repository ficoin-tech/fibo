'use strict';

const Sequelize = require('sequelize');
const { log, levels } = require('../../../../logger');

let Market;

module.exports = {
    load: (sequelize) => {
        Market = sequelize.define('market', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            name: Sequelize.STRING,
            exchange: Sequelize.STRING,
            percentBelowSellExtremum: Sequelize.STRING,
            percentAboveBuyExtremum: Sequelize.STRING,
            minPercentProfitWhenSellingWithoutTaxes: Sequelize.STRING,
            minPercentProfitWhenBuyingWithoutTaxes: Sequelize.STRING,
        });

        return {
            getMarkets: async (exchange) => {
                try {
                    const markets = await Market.all({
                        where: {
                            exchange
                        }
                    });
                    return markets;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            },

            addMarket: async (marketObject, exchange) => {
                try {
                    const market = await Market.findOrCreate({
                        where: {
                            name: marketObject.name,
                            exchange
                        },
                        defaults: {
                            ...marketObject,
                            exchange
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

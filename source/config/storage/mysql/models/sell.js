'use strict';

const Sequelize = require('sequelize');
const { log, levels } = require('../../../../logger');

let Sell;

module.exports = {
    load: (sequelize) => {
        Sell = sequelize.define('sell', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            price: Sequelize.STRING,
            amount: Sequelize.STRING,
            market: Sequelize.STRING
        });

        return {
            getSells: async market => {
                try {
                    const sells = await Sell.all({
                        where : {
                            market
                        }
                    });
                    return sells;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            },

            overrideSells: async (sells, market) => {
                try {
                    await Sell.destroy({
                        where: {
                            market
                        }
                    });

                    const sellsToInsert = [];
                    sells.forEach(s => {
                        sellsToInsert.push(
                            {
                                price: s.price,
                                amount: s.amount.toNumber(),
                                market: market
                            }
                        );
                    });

                    const storedSells = await Sell.bulkCreate(sellsToInsert);

                    return storedSells.length !== 0 ;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return false;
                }
            }
        };
    },
};

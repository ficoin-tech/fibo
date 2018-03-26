'use strict';

const Sequelize = require('sequelize');
const { log, levels } = require('../../../../logger');

let Buy;

module.exports = {
    load: (sequelize) => {
        Buy = sequelize.define('buy', {
            id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
            price: Sequelize.STRING,
            amount: Sequelize.STRING,
            market: Sequelize.STRING
        });

        return {
            getBuys: async market => {
                try {
                    const buys = await Buy.all({
                        where : {
                            market
                        }
                    });
                    return buys;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return [];
                }
            },

            overrideBuys: async (buys, market) => {
                try {
                    await Buy.destroy({
                        where: {
                            market
                        }
                    });

                    const buysToInsert = [];
                    buys.forEach(b => {
                        buysToInsert.push(
                            {
                                amount: b.amount.toNumber(),
                                price: b.price,
                                market: market
                            }
                        );
                    });

                    const storedBuys = await Buy.bulkCreate(buysToInsert);

                    return storedBuys.length !== 0 ;
                } catch (err) {
                    log(err.message, levels.ERROR);
                    return false;
                }
            }
        };
    },
};

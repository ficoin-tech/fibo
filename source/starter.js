'use strict';
const { log, levels } = require('./logger');

const configurator = require('./config');

const SellProcessor = require('./core/SellProcessor');
const BuyProcessor = require('./core/BuyProcessor');
const OrdersTracker = require('./core/OrdersTracker');
const coefficientsParser = require('./core/coefficientsParser');

(async () => {
    const config = await configurator();

    const dbExchanges = await config.getExchanges();
    const exchanges = dbExchanges.map(e => e.dataValues);

    exchanges.forEach(async exchangeDb => {
        const exchangeName = exchangeDb.name;
        const dbMarkets = await config.getMarkets(exchangeName);

        log(`Starting exchange: ${exchangeName} with apiKey: ${exchangeDb.apiKey}`, levels.DEBUG);
        const Exchange = require(`./exchanges/${exchangeName}`);
        const exchange = new Exchange(exchangeDb.apiKey, exchangeDb.apiSecret);

        const processors = {};
        const markets = dbMarkets.map(m => m.dataValues);
        markets.forEach(async m => {
            await addMarket(m);
        });

        async function addMarket(market) {
            const marketName = market.name;
            log(`Exchange ${exchangeName} is starting on market: ${marketName}`, levels.DEBUG);

            exchange.addMarket(marketName);
            const ordersTracker = new OrdersTracker(marketName, config);

            try {
                const coefficients = coefficientsParser(market, exchangeDb);
                processors[marketName] = {
                    sell: new SellProcessor({
                        marketName,
                        exchange,
                        ordersTracker,
                        coefficients
                    }),
                    buy: new BuyProcessor({
                        marketName,
                        exchange,
                        ordersTracker,
                        coefficients
                    })
                };
            } catch (err) {
                log(err.message, levels.ERROR);
                process.kill(process.pid);
            }
        }

        async function connect() {
            exchange.on('buy', async (price, market) => {
                await processors[market].buy.process(price);
            });

            exchange.on('sell', async (price, market) => {
                await processors[market].sell.process(price);
            });
        }

        setTimeout(await connect, 2000);
    });
})();

'use strict';

(async () => {

    const exchangesToBeInitialized = [{
        name: 'binance',
        apiKey: 'apiKey',
        apiSecret: 'apiSecret',
        taxForSelling: 0.1,
        taxForBuying: 0.1
    }];

    const exchangeMarkets = {
        binance: {
            'BTCUSDT' : {
                percentBelowSellExtremum : 0.7,
                percentAboveBuyExtremum : 0.7,
                minPercentProfitWhenSellingWithoutTaxes : 0,
                minPercentProfitWhenBuyingWithoutTaxes: 0
            },
            'ETHUSDT' : {
                marketName: 'ETHUSDT',
                percentBelowSellExtremum : 0.7,
                percentAboveBuyExtremum : 0.7,
                minPercentProfitWhenSellingWithoutTaxes : 0,
                minPercentProfitWhenBuyingWithoutTaxes: 0
            }
        }
    };

    const configurator = require('./config');
    const config = await configurator();

    for (const exchange of exchangesToBeInitialized) {
        await config.addExchange(exchange);
        for (const marketName in exchangeMarkets[exchange.name]) {
            const market = exchangeMarkets[exchange.name][marketName];
            await config.addMarket({ ...market, name: marketName }, exchange.name);
        }
    }

    console.log('Successfully initiation of exchanges and markets!');
    process.kill(process.pid);
})();

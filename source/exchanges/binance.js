'use strict';

const EventEmitter = require('events');
const Decimal = require('decimal.js');
const Binance = require('binance-api-node').default;

const WEBSOCKET_RESET_INTERVAL_MINUTES = 30;

class Exchange extends EventEmitter {
    constructor(apiKey, apiSecret) {
        super();
        this.markets = [];
        this.marketLastPrices = {};
        this._initMarketLastPrices();
        this.client = new Binance({
            apiKey: apiKey,
            apiSecret: apiSecret
        });
        this.isRunning = false;
    }

    addMarket(market) {
        this.markets.push(market);
        this._addLastPricesFor(market);
        if (!this.isRunning) {
            this._run();
        }
    }

    async sell(market, amount, price) {
        return new Decimal(await this.makeOrder(market, 'SELL', amount, price));
    }

    async buy(market, amount, price) {
        return new Decimal(await this.makeOrder(market, 'BUY', amount, price));
    }

    async makeOrder(market, orderType, quantity, price) {
        const result = await this.client.order({
            symbol: market,
            side: orderType,
            quantity: quantity,
            price: price,
            timeInForce: 'IOC' // IOC or GTC
        });
        console.log(orderType + ' amount: ' + quantity + ' at ' + price);
        return result.executedQty;
    }

    _initMarketLastPrices() {
        if (this.markets) {
            this.markets.forEach(market => {
                this._addLastPricesFor(market);
            });
        }
    }

    _addLastPricesFor(market) {
        this.marketLastPrices[market] = {
            lastPriceSell: 0,
            lastPriceBuy: 0
        };
    }

    _run() {
        const handler = depth => {
            if (depth.bestBid !== this.marketLastPrices[depth.symbol].lastPriceSell) {
                this.marketLastPrices[depth.symbol].lastPriceSell = depth.bestBid;
                const price = parseFloat(depth.bestBid);
                this.emit('sell', price, depth.symbol);
            }
            if (depth.bestAsk != this.marketLastPrices[depth.symbol].lastPriceBuy) {
                this.marketLastPrices[depth.symbol].lastPriceBuy = depth.bestAsk;
                const price = parseFloat(depth.bestAsk);
                this.emit('buy', price, depth.symbol);
            }
        };

        const initWebsocket = () => {
            try {
                this.client.ws.ticker(this.markets, handler);
            } catch (__err) {
                try {
                    this.client.ws.ticker(this.markets, handler);
                } catch (err) {
                    console.log(`There was error: ${err.message}`);
                }
            }
        };

        initWebsocket();
        setInterval(() => {
            initWebsocket();
        }, WEBSOCKET_RESET_INTERVAL_MINUTES * 60 * 1000);
    }
}

module.exports = Exchange;

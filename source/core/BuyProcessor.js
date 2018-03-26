'use strict';

const { log, levels } = require('../logger');

const INITIAL_LOWEST_BUY = 999999;

class BuyProcessor {
    constructor(options) {
        this._validateInput(options);
        const { marketName, exchange, ordersTracker, coefficients } = options;
        this.lowestBuy = INITIAL_LOWEST_BUY;
        this.multiplierCheckForBuy = coefficients.multiplierCheckForBuy;
        this.multiplierNewSellOrder = coefficients.multiplierNewSellOrder;
        this.ordersTracker = ordersTracker;
        this.exchange = exchange;
        this.market = marketName;
        this._isLocked = false;
    }

    async process(price) {
        log(`Buy processor (${this.market}) triggered on price: ${price}`, { level: levels.EVERYTHING });

        if (price > this.lowestBuy * this.multiplierCheckForBuy) {
            const amountForBuy = this.ordersTracker.getProfitableBuysAmount(price);
            log(`Trying to buy at : ${price} amount: ${amountForBuy}`, { level: levels.EVERYTHING });
            if (this._isGreaterThanZero(amountForBuy)) {
                if (!this._isLocked) {
                    this._isLocked = true;
                    //consider implement a queue for processing all prices
                    const boughtAmount = await this.exchange.buy(this.market, amountForBuy.toNumber(), price);
                    if (this._isGreaterThanZero(boughtAmount)) {
                        await this.ordersTracker.reduceBuyingAmount(price, boughtAmount);
                        this._isLocked = false;
                        const priceForSell = price * this.multiplierNewSellOrder;
                        await this.ordersTracker.addAmountForSelling(priceForSell, boughtAmount);
                        if (boughtAmount.comparedTo(amountForBuy) === 0) {
                            this.lowestBuy = INITIAL_LOWEST_BUY;
                        }
                    }
                    this._isLocked = false;
                }
            } else {
                this.lowestBuy = INITIAL_LOWEST_BUY;
            }
        } else if (price < this.lowestBuy) {
            this.lowestBuy = price;
            log(`New lowest buy price: ${price}`, { level: levels.EVERYTHING });
        }
    }

    _isGreaterThanZero(amount) {
        return amount && amount.comparedTo(0) === 1;
    }

    _validateInput(options) {
        if (!options.coefficients.multiplierCheckForBuy || options.coefficients.multiplierCheckForBuy <= 0) {
            throw new Error('multiplierCheckForBuy has incorrect value.');
        }

        if (!options.coefficients.multiplierNewSellOrder || options.coefficients.multiplierNewSellOrder <= 0) {
            throw new Error('multiplierNewSellOrder has incorrect value.');
        }

        if (!options.ordersTracker || options.ordersTracker == null) {
            throw new Error('ordersTracker is not provided.');
        }

        if (!options.exchange || options.exchange == null) {
            throw new Error('exchange is not provided.');
        }

        if (!options.marketName || options.marketName == null) {
            throw new Error('market is not provided.');
        }
    }
}

module.exports = BuyProcessor;

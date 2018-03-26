'use strict';

const Decimal = require('decimal.js');
const { log, levels } = require('../logger');

class SellProcessor {
    constructor(options) {
        this._validateInput(options);
        const { marketName, exchange, ordersTracker, coefficients } = options;
        this.highestSell = 0;
        this.multiplierCheckForSell = coefficients.multiplierCheckForSell;
        this.multiplierNewBuyOrder = coefficients.multiplierNewBuyOrder;
        this.percentSellTax = coefficients.percentSellTax;
        this.ordersTracker = ordersTracker;
        this.exchange = exchange;
        this.market = marketName;
        this._isLocked = false;
    }

    async process(price) {
        log(`Sell processor (${this.market}) triggered on price: ${price}`, { level: levels.EVERYTHING });

        if (price < this.highestSell * this.multiplierCheckForSell) {
            const amountForSell = this.ordersTracker.getProfitableSellsAmount(price);
            log(`Trying to sell at : ${price} amount: ${amountForSell}`, { level: levels.EVERYTHING });
            if (this._isGreaterThanZero(amountForSell)) {
                if (!this._isLocked){
                    this._isLocked = true;
                    const soldAmount = await this.exchange.sell(this.market, amountForSell.toNumber(), price);
                    if (this._isGreaterThanZero(soldAmount)) {
                        await this.ordersTracker.reduceSellingAmount(price, soldAmount);
                        this._isLocked = false;
                        const priceForBuy = price * this.multiplierNewBuyOrder;
                        await this.ordersTracker.addAmountForBuying(priceForBuy, soldAmount);
                    }
                    this._isLocked = false;
                }
            } else {
                this.highestSell = 0;
            }
        } else if (price > this.highestSell) {
            this.highestSell = price;
            log(`New highest sell price: ${price}`, { level: levels.EVERYTHING });
        }
    }

    _isGreaterThanZero(amount) {
        return amount.comparedTo(0) === 1;
    }

    _calculateFreshMoney(price, amount) {
        const sellTaxNotPercent = new Decimal(this.percentSellTax).dividedBy(100);
        const taxMultiplier = new Decimal(1).plus(sellTaxNotPercent);
        return new Decimal(price).times(amount).times(taxMultiplier);
    }

    _validateInput(options) {
        if (!options.coefficients.multiplierCheckForSell || options.coefficients.multiplierCheckForSell <= 0) {
            throw new Error('multiplierCheckForSell has incorrect value.');
        }

        if (!options.coefficients.multiplierNewBuyOrder || options.coefficients.multiplierNewBuyOrder <= 0) {
            throw new Error('multiplierNewBuyOrder has incorrect value.');
        }

        if (!options.coefficients.percentSellTax || options.coefficients.percentSellTax <= 0) {
            throw new Error('percentSellTax has incorrect value.');
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

module.exports = SellProcessor;

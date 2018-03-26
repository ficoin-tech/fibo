'use strict';

const SortedPriceMap = require('./Map');

class OrdersTracker {

    constructor(market, db) {
        this.market = market;
        this.db = db;
        this.buys = new SortedPriceMap(false);
        this.sells = new SortedPriceMap();
        this._initBuys();
        this._initSells();
    }

    getProfitableSellsAmount(price) {
        return this.sells.get(price);
    }

    getProfitableBuysAmount(price) {
        return this.buys.get(price);
    }

    async reduceSellingAmount(price, soldAmount) {
        this.sells.reduceAmount(price, soldAmount);
        await this.db.overrideSells(this.sells.array, this.market);
    }

    async reduceBuyingAmount(price, boughtAmount) {
        this.buys.reduceAmount(price, boughtAmount);
        await this.db.overrideBuys(this.buys.array, this.market);
    }

    async addAmountForSelling(price, amount) {
        this.sells.put(price, amount);
        await this.db.overrideSells(this.sells.array, this.market);
    }

    async addAmountForBuying(price, amount) {
        this.buys.put(price, amount);
        await this.db.overrideBuys(this.buys.array, this.market);
    }

    async _initBuys() {
        const savedBuys = await this.db.getBuys(this.market);
        this.buys.addAll(savedBuys.map(b => b.dataValues));
    }

    async _initSells() {
        const savedSells = await this.db.getSells(this.market);
        this.sells.addAll(savedSells.map(s => s.dataValues));
    }

}

module.exports = OrdersTracker;

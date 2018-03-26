'use strict';

const Decimal = require('decimal.js');

const validate = (value, name) => {
    if (!value || typeof value === 'undefined') {
        throw new Error(`${name} is undefined!`);
    }
};

const ratesParser = (market, exchange) => {
    const {
        percentBelowSellExtremum,
        percentAboveBuyExtremum,
        minPercentProfitWhenSellingWithoutTaxes,
        minPercentProfitWhenBuyingWithoutTaxes
    } = market;

    const { taxForSelling, taxForBuying } = exchange;

    validate(percentBelowSellExtremum, 'percentBelowSellExtremum');
    validate(percentAboveBuyExtremum, 'percentAboveBuyExtremum');
    validate(minPercentProfitWhenSellingWithoutTaxes, 'minPercentProfitWhenSellingWithoutTaxes');
    validate(minPercentProfitWhenBuyingWithoutTaxes, 'minPercentProfitWhenBuyingWithoutTaxes');
    validate(taxForSelling, 'taxForSelling');
    validate(taxForBuying, 'taxForBuying');

    const percentSellTax = taxForSelling;
    const taxWholeCyclePercent = new Decimal(taxForSelling).plus(taxForBuying).toNumber();

    const percentForMultiplierSell = new Decimal(minPercentProfitWhenSellingWithoutTaxes)
        .plus(taxWholeCyclePercent)
        .dividedBy(100);
    const multiplierNewSellOrder = new Decimal(1).plus(percentForMultiplierSell).toNumber();

    const percentForMultiplierBuy = new Decimal(minPercentProfitWhenBuyingWithoutTaxes)
        .plus(taxWholeCyclePercent)
        .dividedBy(100);
    const multiplierNewBuyOrder = new Decimal(1).minus(percentForMultiplierBuy).toNumber();

    const multiplierCheckForSell = new Decimal(1).minus(new Decimal(percentBelowSellExtremum).dividedBy(100)).toNumber();
    const multiplierCheckForBuy = new Decimal(1).plus(new Decimal(percentAboveBuyExtremum).dividedBy(100)).toNumber();

    return {
        multiplierCheckForBuy,
        multiplierCheckForSell,
        multiplierNewSellOrder,
        multiplierNewBuyOrder,
        percentSellTax,
        taxWholeCyclePercent
    };
};

module.exports = ratesParser;

'use strict';

const Decimal = require('decimal.js');

class MyMap {

    constructor(isAsc = true) {
        this.array = [];
        this.sortingCallback = (x, y) => isAsc ? x < y : x > y;
    }

    addAll(array) {
        for (const e of array) {
            const price = parseFloat(e.price);
            this.put(price, new Decimal(e.amount));
        }
    }

    put(price, amount) {
        amount = new Decimal(amount);
        const index = this.findIndex(price);

        if (index > 0 && this.array[index - 1].price === price) {
            this.array[index - 1].amount = this.array[index - 1].amount.plus(amount);
            return true;
        }

        if (this.array.length === index) {
            this.array.push({ price, amount });
            return true;
        }

        this.array.splice(index, 0, { price, amount });
        return true;
    }

    findIndex(price) {
        const arrayLength = this.array.length;
        let i = 0;
        for (; i < arrayLength; i++) {
            if (this.sortingCallback(price, this.array[i].price)) {
                return i;
            }
        }

        if (arrayLength === 0) {
            return 0;
        }

        return arrayLength;
    }

    get(price) {
        const arrayLength = this.array.length;
        let amount = new Decimal(0);

        for (let i = 0; i < arrayLength; i++) {
            if (this.sortingCallback(price, this.array[i].price)) {
                break;
            }
            amount = amount.plus(this.array[i].amount);
        }

        return amount;
    }

    reduceAmount(price, amount) {
        const lastIndex = this.findIndex(price);
        let itemsForRemove = 0;

        if (lastIndex === 0) {
            return;
        }
        amount = new Decimal(amount);
        for (let i = lastIndex - 1; i >= 0; i--) {
            if (amount.comparedTo(this.array[i].amount) >= 0) {
                amount = amount.minus(this.array[i].amount);
                this.array[i].amount = new Decimal(0);
                itemsForRemove++;
            } else {
                this.array[i].amount = this.array[i].amount.minus(amount);
                break;
            }
        }

        this.array.splice(lastIndex - itemsForRemove, itemsForRemove);
    }

    forEach(callback) {
        const arrayLength = this.array.length;
        let i = 0;
        for (; i < arrayLength; i++) {
            callback(this.array[i].price, this.array[i].amount);
        }
    }

}

module.exports = MyMap;

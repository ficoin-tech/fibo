# fibo
<b>Description</b><br>
FIBO is a command-line cryptocurrency trading bot using Node.js and MySQL.

<b>Quick-start</b><br>
1. Download npm and nodeJS from https://www.npmjs.com/get-npm and install them
2. Download and install MySQL Server from https://dev.mysql.com/downloads/mysql/
3. Download and install MySQL Workbench(IDE for MySQL) from https://dev.mysql.com/downloads/workbench/
5. Run MySQL Workbench with user:root and password:root
6. Create database scheme and name it fibo
4. Download zip from 'Clone or download' button from https://github.com/ficoin-tech/fibo/tree/dev
5. Unzip it in some directory
7. Open bash console and navigate to the directory where you unzipped fibo
8. Run 'npm install'
9. Run 'node source/initExchanges.js' 
10. Get your api ket and secret from binance
11. Open workbench and navigate to table 'exchanges' 
12. Place your api key in column with name 'apiKey' on the only row in the table (where name is binance)
13. Place your api secret in column with name 'apiSecret' on the only row in the table (where name is binance)
14. Check if the trading taxes for your account at binance are set up correct - 'taxForSelling' and ''taxForBuying' - percentige value
15. Navigate to table 'markets'
16. Update the markets you want to trade on.
17. Navigate to 'sells'
18. Add order for selling using the query -- adjust the market, price and amount you want to sell, as you should know that this price is the lowest price you will sell on
'INSERT INTO `fibo`.`sells` (`id`, `price`, `amount`, `market`, `createdAt`, `updatedAt`) VALUES ('1', '460', '1', 'ETHUSDT', '2018-03-27 11:11:11', '2018-03-27 11:11:11');'
19. Add some more entries in the table, if you want. 
20. Navigate to 'buys'
21. Add order for selling using the query -- adjust the market, price and amount you want to buy, as you should know that this price is the highest price you will buy on
'INSERT INTO `fibo`.`buys` (`id`, `price`, `amount`, `market`, `createdAt`, `updatedAt`) VALUES ('1', '440', '1', 'ETHUSDT', '2018-03-27 11:11:11', '2018-03-27 11:11:11');'
22. Add some more entries in the table, if you want. 
23. Use command 'npm start' in bash in the directory of fibo to start it.

<b>Disclaimer</b><br>
FIBO is NOT a sure-fire profit machine. Use it AT YOUR OWN RISK.
Crypto-currency is still an experiment, and therefore so is FIBO. Meaning, both may fail at any time.
Running a bot, and trading in general requires careful study of the risks and parameters involved. A wrong setting can cause you a major loss.
Never leave the bot un-monitored for long periods of time. FIBO doesn't know when to stop, so be prepared to stop it if too much loss occurs.
Often times the default trade parameters will underperform vs. a buy-hold strategy, so run some simulations and find the optimal parameters for your chosen exchange/pair before going "all-in".

<br>
<b>License: MIT</b>

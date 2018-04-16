# The chess bot for Telegram messenger

## Overview

A simple implementation of a chess game, based on editing a reply markup represetation of a chess board. Bot uses the `node-chess` package, which is driven by the algebraic notation of moves.

### **Features:**

- Multiplayer
- Multiroom

## Usage

[Demo](https://t.me/chessy_bot) (WIP version).

### Commands

/start

## Install and run own instance

First of all clone this repository and install dependencies. Run in the terminal:

```bash
git clone git@github.com:Piterden/chessbot.git
cd chessbot
npm i
```

Then you need to create and fill up a new `.env` file:

```bash
cp .env.example .env
editor .env
```

## Built With

* [Telegraf.js](https://github.com/telegraf/telegraf) - The bot framework.
* [Node-Chess](https://github.com/brozeph/node-chess) - A simple node.js library for parsing and validating chess board position with an algebraic move parser

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Denis Efremov** - *Code* - [Piterden](https://github.com/Piterden)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

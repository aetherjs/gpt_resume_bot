# GPT Resumé Bot

I'm tired of reading all those crypto news channels... Why can't robots do this for me? 

# Development

Stack: 

- Typescript
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- [openai-node](https://github.com/openai/openai-node)

# How to run

`npm install`

Then create a .env file in the root directory and add your TG bot API key like:

`TELEGRAM_BOT_TOKEN='blah-blah-228'`
`OPENAI_API_KEY='wawaweewa-300'`

Lastly, to run locally you can:

`npm run start`

This will compile the typescript to a /dist folder and run the node.js server locally.

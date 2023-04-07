# celbot

> A GitHub App built with [Probot](https://github.com/probot/probot) that A github bot for enforcing Matt&#x27;s wishes upon the developers at celestia

## Setup

### Quickstart

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

### Local Development

When developing locally you can use 1 of 2 methods to run the bot.

1. Hot reload with nodemon
1. Simulate a webhook event

#### Hot reload with nodemon

```sh
# Install dependencies
npm install

# Run the bot with nodemon
npm run dev
```

#### Simulate a webhook event

Follow the instructions
[here](https://probot.github.io/docs/simulating-webhooks) to setup a webhook on
your local repository. Then you can trigger the webhook event by running the
following command. There is a folder `test/fixtures/live` that is ignored by git
that you can use to store your webhook payloads.

```sh
# Install dependencies
npm install

# Simulate the webhook event
npm run mock
```

## Docker

```sh
# 1. Build container
docker build -t celbot .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> celbot
```

## Contributing

If you have suggestions for how celbot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2023 Strange Loop Labs AG

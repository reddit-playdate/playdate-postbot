# playdate-postbot

Gets new posts from /r/Playdate, posts them to Discord webhooks.

## Installation

Requires [Node](https://nodejs.org/en/). Install dependencies with `npm install`.

## Usage

The Procfile specifies `dev` and `web` process. Use `nf start <process>` to load environment variables and start the app. The environment file holds URIs for Discord webhooks. These are stored in an object in `index.js` for easy access. If you only want to use this app with one webhook, it would be much easier to simply `fetch()` from one URL.

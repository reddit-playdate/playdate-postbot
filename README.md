# playdate-postbot

Gets new posts from a subreddit and post them to a Discord webhook.

## Usage

Meant for deployment with AWS Lambda. The WEBHOOK and SUBREDDIT environment variables are URLs. Append `.json` to the end of your subreddit URL or you're going to have a bad time. Also maybe think about adjusting the argument to `timedelta()` depending how busy/slow the subreddit is.

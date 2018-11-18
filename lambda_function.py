import os
from botocore.vendored import requests
import json
from datetime import datetime, timedelta

this_time = datetime.utcnow().replace(second=0)
last_time = this_time - timedelta(minutes=30)
webhook = os.environ['WEBHOOK']
subreddit = os.environ['SUBREDDIT']
headers = {
    'User-Agent': 'Playdate Postbot',
    'Content-Type': 'multipart/form-data'
}

def embed(post):
    return {
        'title': post['data']['title'],
        'type': 'rich',
        'description': post['data']['selftext'],
        'url': post['data']['url'],
        'color': 16711680,
        'footer': {'text': 'new post from /u/' + post['data']['author']},
        'thumbnail': {'url': post['data']['url']},
        'provider': {'name': 'Reddit', 'url': 'https://www.reddit.com'}
    }

def lambda_handler(event, context):
    res = requests.get(subreddit, headers=headers).json()
    posts = res['data']['children']
    new_posts = [p for p in posts if this_time > datetime.utcfromtimestamp(p['data']['created_utc'])  > last_time]
    
    if len(new_posts) > 0:
        embeds = [embed(p) for p in new_posts]
        data = json.dumps({'embeds': embeds})
        requests.post(webhook, headers=headers, data=data)
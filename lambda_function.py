import os
from botocore.vendored import requests
import json
import html
from datetime import datetime, timedelta

this_time = datetime.utcnow().replace(second=0)
last_time = this_time - timedelta(minutes=5)
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
        'description': html.unescape(post['data']['selftext']).replace('\n', ' ').replace('&#x200B;', '').strip()[0:280] + '...',
        'url': post['data']['url'],
        'color': 16711680,
        'timestamp': datetime.utcfromtimestamp(post['data']['created_utc']).isoformat(),
        'footer': {'text': 'post from /u/' + post['data']['author']},
        'thumbnail': {'url': post['data']['url']},
        'provider': {'name': 'Reddit', 'url': 'https://www.reddit.com'}
    }

def lambda_handler(event, context):
    res = requests.get(subreddit, headers=headers).json()
    posts = res['data']['children']
    if len(posts) < 1:
        return
    new_posts = [p for p in posts if this_time > datetime.utcfromtimestamp(p['data']['created_utc'])  > last_time]
    
    if len(new_posts) > 0:
        embeds = [embed(p) for p in new_posts]
        data = json.dumps({'embeds': embeds})
        requests.post(webhook, headers=headers, data=data)
        return
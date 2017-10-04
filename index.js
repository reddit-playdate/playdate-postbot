const fetch = require('node-fetch')
const webhook = process.env.WEBHOOK
const freq = 10 * 60 * 1000

checkSub()
setInterval(checkSub, freq)

function checkSub () {
  fetch('https://www.reddit.com/r/Playdate/new/.json')
  .then(response => {
    return response.json()
  })
  .then(json => {
    let newPosts = json.data.children
    for (let post of newPosts) {
      let time = Math.floor(Date.now() / 1000)
      if (post.data.created_utc < time - freq) {
        return
      } else {
        fetch(webhook,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            body: JSON.stringify({ embeds: [renderEmbed(post)] })
          }
        )
      }
    }
  }
)

function renderEmbed (obj) {
  return {
    title: obj.data.title,
    type: 'rich',
    description: obj.data.selftext.substring(0, obj.data.selftext.indexOf('.') + 1),
    url: obj.data.url,
    timestamp: new Date(obj.data.created_utc * 1000),
    color: 16711680,
    footer: { text: `new post on /r/Playdate | /u/${obj.data.author}` },
    thumbnail: { url: obj.data.thumbnail },
    provider: { name: 'Reddit', url: 'https://www.reddit.com' }
  }
}

const fs = require('fs')
const file = 'posts.db'
const exists = fs.existsSync(file)
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(file)
const fetch = require('node-fetch')

if (!exists) {
  db.run('CREATE TABLE Posts (name CHAR(9))')
}

const webhooks = {
  '#lfg': process.env.WH_LFG,
  '#rocket-league': process.env.WH_RL,
  '#cooperators': process.env.WH_COOP,
  '#strategists': process.env.WH_STRAT,
  '#survivalists': process.env.WH_SURV,
  '#drivers': process.env.WH_DRIVE,
  '#shooters': process.env.WH_FPS
}

checkSub()
setInterval(checkSub, 900000)

function checkSub () {
  fetch('https://www.reddit.com/r/Playdate/new/.json')
  .then(response => {
    return response.json()
  })
  .then(json => {
    let newPosts = json.data.children
    db.parallelize(function () {
      for (let post of newPosts) {
        let name = `"${post.data.name}"`
        let channel = webhooks[post.data.link_flair_text] || webhooks['#lfg']
        console.log(`Checking Post :name=${name}`)
        db.get('SELECT * FROM Posts WHERE name=(?)', [name], (err, row) => {
          if (err) { return console.log(err) }
          if (row) {
            return console.log(`Post :name=${name} already seen.`)
          } else {
            fetch(channel,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                body: JSON.stringify({ embeds: [renderEmbed(post)] })
              })
            db.run('INSERT INTO Posts VALUES (?)', [name])
          }
        })
      }
    })
  })
}

function renderEmbed (obj) {
  if (!obj.kind || obj.kind !== 't3') { return }
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

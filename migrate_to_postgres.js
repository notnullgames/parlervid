/**

This will build the postgres db for mirrors. This should only have to be done once

**/

const db = require('./db')
const request = require('request-promise')

// get the original parler format of the URL
const parlerUrl = id => `${id.substr(0, 2)}/${id.substr(2, 2)}/${id}`

// setup the intitial databse
async function setupDb () {
  await db.query('DROP TABLE IF EXISTS mirrors;')
  await db.query(`
    CREATE TABLE mirrors (
      id char(12) PRIMARY KEY,
      url varchar(200)
    );
  `)
}

// get dupe-list for pl.gammaspectra.live and save in database
async function storeDupes () {
  const rows = (await request('https://pl.gammaspectra.live/video.parler.com/dupes.txt')).split('\n')
  for (const r in rows) {
    if (r > 0) {
      const [dupe, stored] = rows[r].split(', ')
      const q = await db.query('INSERT INTO mirrors (id, url) VALUES ($1, $2) RETURNING id, url', [dupe, `https://pl.gammaspectra.live/video.parler.com/${parlerUrl(stored)}`])
      console.log('saved', q.rows[0])
    }
  }
}

// save a mirror object in database
async function storeMirrorList (mirror) {
  for (const id of Object.keys(mirror)) {
    const q = await db.query('INSERT INTO mirrors (id, url) VALUES ($1, $2) RETURNING id, url', [id, mirror[id]])
    console.log('saved', q.rows[0])
  }
}

async function main () {
  await db.connect()
  await setupDb()
  await storeDupes()
  await storeMirrorList(require('./data/mirror1.json'))
  await storeMirrorList(require('./data/mirror2.json'))
  await storeMirrorList(require('./data/mirror3.json'))
  db.end()
}

main()

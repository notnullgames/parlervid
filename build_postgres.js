/**
 * This builds the database. It should only need to be done once.
 */
const request = require('request-promise')
const cheerio = require('cheerio')
const { readFileSync } = require('fs')
const bencode = require('bencode')
const db = require('./db')

// setup the intitial databse
async function setupDb () {
  await db.query('DROP TABLE IF EXISTS mirrors;')
  await db.query(`
    CREATE TABLE mirrors (
      id VARCHAR PRIMARY KEY,
      url VARCHAR
    );
  `)
}

// save a mirror object in database
async function storeMirrorList (mirror) {
  await db.query(`INSERT INTO mirrors (id, url) VALUES ${Object.keys(mirror).map(id => `('${id}', '${mirror[id]}')`).join(', ')} ON CONFLICT (id) DO NOTHING`)
}

// get the full primary mirror URLs (they aren't normalized) from torrent file
// https://pl.gammaspectra.live/video_parler_com.torrent
async function primaryList() {
  const rows = bencode.decode(readFileSync('video_parler_com.torrent')).info.files
    .map(f => f.path.map(b => b.toString()).join('/'))
    .filter(f => f.split('/').pop() !== 'dupe.txt')
    .map(f => `( '${f.replace('_small', '').split('.')[0].split('/').pop()}', 'https://pl.gammaspectra.live/video.parler.com/${f}' )`)
  await db.query(`INSERT INTO mirrors VALUES ${rows.join(', ')} ON CONFLICT (id) DO NOTHING`)
}

// get dupe-list for pl.gammaspectra.live and save in database as mirror links
// https://pl.gammaspectra.live/video.parler.com/dupes.txt
async function storeDupes () {
  const insertable = []
  const dupes = readFileSync('dupes.txt').toString().split('\n')
  for (const r in dupes) {
    if (r > 0) {
      const [dupe, stored] = dupes[r].split(', ')
      const { rows } = await db.query(`SELECT url FROM mirrors WHERE id='${stored}'`)
      if (rows && rows.length){
        insertable.push(`( '${dupe}', '${rows[0].url}' )`)
        console.log(`${dupe} -> ${stored}`)
      }else{
        console.log(`No URL on record for ${stored}`)
      }
    }
  }
  await db.query(`INSERT INTO mirrors VALUES ${insertable.join(', ')} ON CONFLICT (id) DO NOTHING`)
}

async function run() {
  await db.connect()
  await setupDb()
  await primaryList()
  await storeMirrorList(require('./data/mirror1.json'))
  await storeMirrorList(require('./data/mirror2.json'))
  await storeMirrorList(require('./data/mirror3.json'))
  // await storeDupes()
  db.end()
}
run()

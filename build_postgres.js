/**
 * This builds the database. It should only need to be done once.
 */
const request = require('request-promise')
const cheerio = require('cheerio')
const db = require('./db')

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

// save a mirror object in database
async function storeMirrorList (mirror) {
  await db.query(`INSERT INTO mirrors (id, url) VALUES ${Object.keys(mirror).map(id => `('${id}', '${mirror[id]}')`).join(', ')}`)
}

// get the full primary mirror URLs (they aren't normalized)
async function primaryList() {
  const items = []
  for (const a of await primaryListSublinks()) {
    for (const b of await primaryListSublinks(a)) {
      for (const l of await primaryListSublinks(`${a}${b}`)){
        const id = l.split('.')[0].replace('_small', '')
        const url = `https://pl.gammaspectra.live/video.parler.com/${a}${b}${l}`
        items.push(`('${id}', '${url}')`)
        console.log(id)
      }
    }
  }
  await db.query('INSERT INTO mirrors (id, url) VALUES ' + items.join(','))
}

const primaryListSublinks = async (url='') => {
  const $ = cheerio.load(await request(`https://pl.gammaspectra.live/video.parler.com/${url}`))
  const out = []
  $('a').each((e, el) => {
    if (!el.attribs.href.endsWith('.txt') && el.attribs.href !== '../') {
      out.push(el.attribs.href)
    }
  }) 
  return out
}

// get dupe-list for pl.gammaspectra.live and save in database as mirror links
async function storeDupes () {
  const dupes = (await request('https://pl.gammaspectra.live/video.parler.com/dupes.txt')).split('\n')
  for (const r in dupes) {
    if (r > 0) {
      const [dupe, stored] = dupes[r].split(', ')
      const { rows } = await db.query('SELECT url FROM mirrors WHERE id=?', [ stored ])
      if (rows){
        await db.query('INSERT INTO mirrors (id, url) VALUES ($1, $2)', [dupe, rows[0].url])
        console.log(`${dupe} -> ${stored}`)
      }else{
        console.log(`No link on record for ${stored}`)
      }
    }
  }
}

async function run() {
  await db.connect()
  await setupDb()
  await primaryList()
  await storeDupes()
  // await storeMirrorList(require('./data/mirror1.json'))
  // await storeMirrorList(require('./data/mirror2.json'))
  // await storeMirrorList(require('./data/mirror3.json'))
  db.end()
}
run()

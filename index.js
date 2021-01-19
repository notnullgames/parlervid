/*
This is a very simple proxy that tries to pick the right mirror for a video ID.
*/

const express = require('express')
const ytdl = require('ytdl-core')
const db = require('./db')

const { PORT = 5000 } = process.env

db.connect()

express()
  // show the map
  .get('/', (req, res) => {
    res.sendFile('map.html', { root: __dirname })
  })

  // redirect to raw MP4 URL for youtube video
  .get('/yt/:id', async (req, res) => {
    const { id } = req.params
    const info = await ytdl.getInfo(`http://www.youtube.com/watch?v=${id}`)
    res.redirect(301, info.formats.filter(v => v.container === 'mp4' && v.quality === 'medium').pop().url)
  })

  // find the best method of downloading the parler video & redirect to it
  .get('/:id', async (req, res) => {
    const { id } = req.params
    if (!id) {
      throw new Error('No id.')
    }
    const r = await db.query('SELECT url FROM mirrors WHERE id=$1 LIMIT 1', [id])
    if (r && r.rows && r.rows[0]) {
      console.log(`${id} URL found: ${r.rows[0].url}`)
      return res.redirect(301, r.rows[0].url)
    } else {
      console.log(`No video URL found for ${id}`)
      res.status(404).type('txt').send('Not found')
    }
  })

  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

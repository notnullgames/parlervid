/*
This is a very simple proxy that tries to pick the right mirror for a video ID.
*/

const express = require('express')
const db = require('./db')

const { PORT = 5000 } = process.env

db.connect()

express()
  .get('/:id', async (req, res) => {
    const { id } = req.params
    if (!id) {
      throw new Error('No id.')
    }
    const r = await db.query('SELECT id, url FROM mirrors WHERE id=$1 LIMIT 1', [id])
    if (r && r.rows && r.rows.length) {
      console.log(`${id} mirror found: ${r.rows[0].url}`)
      return res.redirect(302, r.rows[0].url)
    } else {
      const url = `https://pl.gammaspectra.live/video.parler.com/${id.substr(0, 2)}/${id.substr(2, 2)}/${id}`
      console.log(`${id} not found in mirrors, trying ${url}`)
      return res.redirect(302, url)
    }
  })
  .get('/', (req, res) => {
    res.sendFile('map.html', { root: __dirname })
  })
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

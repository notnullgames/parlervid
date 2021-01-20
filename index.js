/*
This is a very simple proxy that tries to pick the right mirror for a video ID.
*/

const express = require('express')
const ytdl = require('ytdl-core')

const mirrors = {
  ...require('./data/mirror3.json'),
  ...require('./data/mirror2.json'),
  ...require('./data/mirror1.json')
}

const { PORT = 5000 } = process.env

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

    if (mirrors[id]) {
      return res.redirect(301, mirrors[id])
    } else {
      return res.redirect(301, `https://pl.gammaspectra.live/video.parler.com/${id.substr(0,2)}/${id.substr(2,2)}/${id}`)
    }
  })

  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

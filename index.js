const express = require('express')
const request = require('request')
const ytdl = require('ytdl-core')

const mirrors = [
  require('./mirror1.json'), // https://gofile.io/d/cY5TtS
  require('./mirror2.json'), // https://www.tommycarstensen.com/terrorism/
  require('./mirror3.json')  // https://thepatr10t.github.io/yall-Qaeda
]

const PORT = process.env.PORT || 5000

express()
  // show the map
  .get('/', (req, res) => {
    res.sendFile('map.html', { root: __dirname })
  })

  // all the data for the map
  .get('/data.json', (req, res) => {
    res.sendFile('data.json', { root: __dirname })
  })

  // redirect to raw MP4 URL for youtube video
  .get('/yt/:id', async (req, res) => {
    const { id } = req.params
    const info = await ytdl.getInfo(`http://www.youtube.com/watch?v=${id}`)
    res.redirect(301, info.formats.filter(v => v.container == 'mp4' && v.qualityLabel == '480p60').pop().url)
  })

  // find the best method of downloading the parler video
  .get('/:id', (req, res) => {
    const { id } = req.params
    if (!id) {
      throw new Error('No id.')
    }

    for (mirror of mirrors) {
      if (mirror[id]){
        return res.redirect(mirror[id])
      }
    }

    console.log(`${id} not found in mirror, trying IP trick`)

    request({
      url: `http://8.240.242.124/${id.substr(0, 2)}/${id.substr(2, 2)}/${id}`,
      headers: {
        Host: 'video.parler.com'
      }
    }).pipe(res)
  })
  
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

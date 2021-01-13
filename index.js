const express = require('express')
const request = require('request')
const mirror1 = require('./mirror1.json')
const mirror2 = require('./mirror2.json')

const PORT = process.env.PORT || 5000

express()
  .get('/:id', (req, res) => {
    const { id } = req.params
    if (!id) {
      console.log(`found ${id} in mirror1`)
      throw new Error('No id.')
    }

    if (mirror1[id]) {
      return res.redirect(mirror1[id])
    }

    if (mirror2[id]) {
      console.log(`found ${id} in mirror2`)
      return res.redirect(mirror2[id])
    }

    console.log(`${id} not found in mirror, trying IP`)

    request({
      url: `http://8.240.242.124/${id.substr(0, 2)}/${id.substr(2, 2)}/${id}`,
      headers: {
        Host: 'video.parler.com'
      }
    }).pipe(res)
  })
  .get('/', (req, res) => {
    res.sendFile('map.html', { root: __dirname })
  })
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))

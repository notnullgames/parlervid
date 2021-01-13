const express = require('express')
const request = require('request')

const PORT = process.env.PORT || 5000

express()
  .get('/:id', (req, res) => {
    const { id } = req.params
    if (!id){
      throw new Error('No id.')
    }
    request({
      url: `http://8.240.242.124/${id.substr(0, 2)}/${id.substr(2,2)}/${id}`,
      headers: {
        'Host': 'video.parler.com'
      }
    }).pipe(res)
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
import axios from 'axios'

export default async (req, res) => {
  const { id } = req.query
  const URL = `http://8.240.242.124/${id.substr(0, 2)}/${id.substr(2,2)}/${id}`
  const r = await axios.get(URL, { responseType: 'arraybuffer', headers: { 'Host': 'video.parler.com' } })
  res.setHeader('Content-Disposition', `inline; filename="${id}.mp4"`)
  res.send(r.data)
}

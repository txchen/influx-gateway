import express from 'express'

export default (config) => {
  const router = new express.Router()

  router.get('/ping', (req, res) => {
    let data = {
      ip: req.ip,
      ua: req.headers['user-agent'],
    }
    // ping influxdb to get influx version
    // then list series to verify database connection
    res.json(data)
  })

  router.post('/event', (req, res) => {

  })

  return router
}

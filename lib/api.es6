import express from 'express'
import bodyParser from 'body-parser'
import awrap from 'awrap'
import rq from 'request-promise'
import url from 'url'
import qs from 'querystring'
import LineProtocol from './line-protocol'

export default (config) => {
  const router = new express.Router()
  const lp = new LineProtocol()

  router.use(bodyParser.json())

  router.get('/ping', awrap(async (req, res) => {
    const data = {
      clientIP: req.ip,
      userAgent: req.headers['user-agent'],
    }

    // ping influxdb to get influx version
    const pingResult = await rq({ uri: url.resolve(config.influx_url, 'ping'), resolveWithFullResponse: true })
    data.influxVersion = pingResult.headers['x-influxdb-version']

    // then list series to verify database connection
    let queryUrl = url.resolve(config.influx_url, 'query')
    queryUrl = queryUrl + '?' + qs.stringify({ q: 'show series', db: config.db_name})
    try {
      const queryResult = await rq({ uri: queryUrl, resolveWithFullResponse: true })
      const seriesResult = JSON.parse(queryResult.body).results[0]
      data.seriesCount = seriesResult.hasOwnProperty('series') ? seriesResult.series.length : 0
      res.json(data)
    } catch (err) {
      data.influxError = err.message
      res.status(500).json(data)
    }
  }))

  router.post('/event', awrap(async (req, res) => {
    const message = req.body
    res.send(lp.tranform(message))
  }))

  return router
}

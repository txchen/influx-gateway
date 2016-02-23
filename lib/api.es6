import express from 'express'
import bodyParser from 'body-parser'
import awrap from 'awrap'
import rp from 'request-promise'
import url from 'url'
import qs from 'querystring'
import LineProtocol from './line-protocol'
import { IGWValidationError } from './error'

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
    const pingResult = await rp({ uri: url.resolve(config.influx_url, 'ping'), resolveWithFullResponse: true })
    data.influxVersion = pingResult.headers['x-influxdb-version']

    // then list series to verify database connection
    let queryUrl = url.resolve(config.influx_url, 'query')
    queryUrl = queryUrl + '?' + qs.stringify({ q: 'show series', db: config.db_name })
    try {
      const queryResult = await rp({ uri: queryUrl, resolveWithFullResponse: true })
      const seriesResult = JSON.parse(queryResult.body).results[0]
      data.seriesCount = seriesResult.hasOwnProperty('series') ? seriesResult.series.length : 0
      res.json(data)
    } catch (err) {
      data.influxError = err.message
      res.status(500).json(data)
    }
  }))

  router.post('/query', awrap(async (req, res) => {
    const query = req.body.q
    if (!query || !query.toLowerCase().startsWith('select')) {
      res.status(400).json({ error: 'invalid query' })
      return
    }
    let queryUrl = url.resolve(config.influx_url, 'query')
    queryUrl = queryUrl + '?' + qs.stringify({ db: config.db_name, q: query })
    const queryResult = await rp({ url: queryUrl, resolveWithFullResponse: true })
    const seriesResult = JSON.parse(queryResult.body).results[0]
    res.json(seriesResult)
  }))

  router.post('/event', awrap(async (req, res) => {
    const message = req.body
    let lpMessage = ''
    try {
      lpMessage = lp.tranform(message)
    } catch (err) {
      if (err instanceof IGWValidationError) {
        req.log.warn('input validation failed: ' + err.message)
        err.statusCode = 400
      }
      throw err
    }
    let postUrl = url.resolve(config.influx_url, 'write')
    postUrl = postUrl + '?' + qs.stringify({ db: config.db_name })
    await rp.post({ url: postUrl, resolveWithFullResponse: true, form: lpMessage })
    res.send(lpMessage)
  }))

  return router
}

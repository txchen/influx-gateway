import express from 'express'
import api from './api'
import expressBunyanLogger from 'express-bunyan-logger'

export default (config) => {
  const app = express()
  app.set('trust proxy', 'loopback')
  app.set('etag', false)

  app.use(expressBunyanLogger({
    parseUA: false,
    excludes: [
      'user-agent',
      'body',
      'short-body',
      'req-headers',
      'res-headers',
      'req',
      'res',
      'incoming',
      'response-hrtime',
    ],
  }))

  app.use('/', api(config))

  // error handling, should be after normal middleware
  app.use((err, req, res, _next) => {
    res.status(err.statusCode || 500)
    if (err.statusCode === 500) {
      req.log.error(err)
    }
    const output = {
      reason: err.message,
    }
    if (process.env.NODE_ENV === 'dev') {
      output.stack = err.stack
    }
    res.json(output)
  })

  return app
}

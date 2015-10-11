import express from 'express'
import logger from 'morgan'
import api from './api'

export default (config) => {
  const app = express()
  app.set('trust proxy', 'loopback')

  // TODO: use bunyan
  app.use(logger('dev'))

  app.use('/', api(config))

  // error handling, should be after normal middleware
  app.use((err, req, res, _next) => {
    // TODO: trace error
    res.status(err.status || 500)
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

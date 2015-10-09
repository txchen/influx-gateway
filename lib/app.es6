import express from 'express'
import logger from 'morgan'
import api from './api'
import defaultConfig from './defaultConfig'

const app = express()
app.set('trust proxy', 'loopback')

// TODO: use bunyan
app.use(logger('dev'))

// TODO: implement configuration
const config = defaultConfig
app.use('/', api(config))

// error handling, should be after normal middleware
app.use((err, req, res, _next) => {
  res.status(err.status || 500)
  res.json({
    reason: err.message,
    stack: err.stack,
  })
})

export default app

import express from 'express'
import logger from 'morgan'
import api from './api'

const app = express()
app.set('trust proxy', 'loopback')

// TODO: use bunyan
app.use(logger('dev'))

// TODO: implement configuration
app.use('/', api())

// TODO: investigate express.errorHandler
/* eslint no-unused-vars: 0 */
// error handling, should be after normal middleware
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send(err.statusText)
  } else {
    console.error(err.stack)
    res.status(500).send('Internal Error')
  }
})

export default app

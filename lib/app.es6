import express from 'express'
import logger from 'morgan'

const app = express()
app.set('trust proxy', true) // set trust proxy, otherwise req.protocol is not precise
app.use(logger('dev'))

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

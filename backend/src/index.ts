import express from 'express'

import { errorHandler } from './middlewares/index.js'
import { gamesRouter, genresRouter } from './routes/index.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(gamesRouter)
app.use(genresRouter)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend listening on ${String(port)}...`)
})

import express from 'express'

import { errorHandler } from './middlewares/index.js'
import { gamesRouter, genresRouter, platformsRouter } from './routes/index.js'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(gamesRouter)
app.use(genresRouter)
app.use(platformsRouter)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Backend listening on ${String(port)}...`)
})

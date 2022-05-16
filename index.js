import express,{json} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import authRouter from './routers/authRouter.js'
import cartRouter from './routers/cartRouter.js'
import itemsRouter from './routers/itemsRouter.js'

dotenv.config()

const app=express()

app.use( json() )
app.use( cors() )

app.use(authRouter)
app.use(cartRouter)
app.use(itemsRouter)

const port=process.env.PORTA || 5007
app.listen(port,()=>console.log(`Servidor em pé na porta ${port}`))
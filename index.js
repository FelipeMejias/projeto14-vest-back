import express,{json} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import {MongoClient} from 'mongodb'
dotenv.config()
const app=express()
const port=process.env.PORTA || 5007
app.use( json() )
app.use( cors() )

let db
const mongoClient=new MongoClient(process.env.MONGO_URL)
try{
    await mongoClient.connect()
    db=mongoClient.db(process.env.BANCO)
    
}catch{console.log('Erro ao conectar ao banco')}




app.post('/itens', async (req,res)=>{
    const body=req.body
    
    try{
        await db.collection('itens').insertOne(body)
        res.sendStatus(200)
    }catch{res.sendStatus(499)}
})

app.get('/itens', async (req,res)=>{
    console.log(req.query)
    
    try{
        const lista =await db.collection('itens').find(req.query).toArray()
        res.send(lista);console.log('1')
    }catch{res.sendStatus(499);console.log('2')}
})




app.listen(port,()=>console.log(`Servidor em pé na porta ${port}`))
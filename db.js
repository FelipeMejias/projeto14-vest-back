import {MongoClient} from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

let db = null

const mongoClient=new MongoClient(process.env.MONGO_URL)
try{
    await mongoClient.connect()
    db=mongoClient.db(process.env.BANCO)
}catch (error){
    console.log('Erro ao conectar ao banco')
    console.log(error)
}

export default db
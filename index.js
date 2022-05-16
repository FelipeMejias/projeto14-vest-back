import express,{json} from 'express'
import cors from 'cors'
import joi from 'joi'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import {MongoClient} from 'mongodb'
import {v4 as uuid} from 'uuid'
dotenv.config()

const app=express()

app.use( json() )
app.use( cors() )

let db
const mongoClient=new MongoClient(process.env.MONGO_URL)
try{
    await mongoClient.connect()
    db=mongoClient.db(process.env.BANCO)
}catch{console.log('Erro ao conectar ao banco')}

// Login
app.post("/sign-in", async (req, res) => {
    console.log("entrei")
    const signInSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    });
    const {error} = signInSchema.validate(req.body, {abortEarly: false})
    if (error) {
        return res.status(422).send(error.details.map(detail => detail.message))
    }
    
    try {
        const user = await db.collection("users").findOne({email: req.body.email})
        if(!user) return res.sendStatus(404)
        if(user && bcrypt.compareSync(req.body.password, user.password)) {
            const token = uuid()
            await db.collection("sesions").insertOne({token, userID: user.email})
            res.send({token, name: user.name})
        }
    } catch (error) {
        return res.sendStatus(500)
    }
})


// Cadasrto
app.post("/sign-up", async (req, res) => {
    const signUpSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required(),
        confirmPassword: joi.ref('password')
    });
    const {error} = signUpSchema.validate(req.body, {abortEarly: false})
    if (error) {
        return res.status(422).send(error.details.map(detail => detail.message))
    }

    try {
        const {name, email, password} = req.body
        
        const SALT = 10
        const hashPassword = bcrypt.hashSync(password, SALT)

        await db.collection("users").insertOne({
            name,
            email,
            password: hashPassword
        })
        res.sendStatus(201)
    } catch (error) {
        return res.sendStatus(500)
    }
})



app.post('/itens', async (req,res)=>{
    const body=req.body
    const {nome}=req.body
    try{
        await db.collection('itens').insertOne({...body,id:nome.split(' ').join('')})
        res.sendStatus(200)
    }catch{res.sendStatus(499)}
})

app.get('/itens', async (req,res)=>{

    try{
        const lista =await db.collection('itens').find(req.query).toArray()
        res.send(lista)
    }catch{res.sendStatus(499)}
})

app.get('/itens/:idItem', async (req,res)=>{
    const id=req.params.idItem
    
    try{
        const item =await db.collection('itens').findOne({id})
        res.send(item)
    }catch{res.sendStatus(499)}
})

app.get('/busca/:palavra', async (req,res)=>{
    const {palavra}=req.params
    
    try{
        const listaTodos =await db.collection('itens').find({}).toArray()
        const listaFiltrados=listaTodos.filter((obj)=>{
            let bool
            const lista=obj.nome.split(' ')
            for(let k=0;k<lista.length;k++){
                bool=true
                for(let w=0;w<palavra.length;w++){
                    if(palavra[w]!=lista[k][w]){bool=false}
                }
                if(bool){return true}
            }return false

        })
        res.send(listaFiltrados)
        
    }catch{res.sendStatus(499)}
})
app.get('/carrinho/:idItem', async (req,res)=>{
    const {token}=req.headers
    const {idItem}=req.params
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        const item=await db.collection('carrinho').findOne({usuario:usuario.email,id:idItem})
        if(item){return res.send(true)}
        res.send(false)

    }catch{res.sendStatus(499)}
})
app.delete('/carrinho/:idItem', async (req,res)=>{
    const {token}=req.headers
    const {idItem}=req.params
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        const item=await db.collection('carrinho').deleteOne({usuario:usuario.email,id:idItem})
        res.sendStatus(200)

    }catch{res.sendStatus(499)}
})
app.get('/carrinho', async (req,res)=>{
    const {token}=req.headers
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        const lista=await db.collection('carrinho').find({usuario:usuario.email}).toArray()
        let total=0
        for(let k=0;k<lista.length;k++){
            total+=parseFloat(lista[k].valor)
        }
        res.send({itens:lista,total})

    }catch{res.sendStatus(499)}
})
app.post('/carrinho', async (req,res)=>{
    const {token}=req.headers
    const body=req.body
    delete body._id
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        await db.collection('carrinho').insertOne({...body,usuario:usuario.email})
        res.sendStatus(200)

    }catch(e){res.status(499).send(e)}
})

const port=process.env.PORTA || 5007
app.listen(port,()=>console.log(`Servidor em pé na porta ${port}`))
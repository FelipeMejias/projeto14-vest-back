import express,{json} from 'express'
import cors from 'cors'
import joi from 'joi'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'

import db from './db.js'

dotenv.config()

const app=express()

app.use( json() )
app.use( cors() )

// Login
app.post("/sign-in", async (req, res) => {
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
            await db.collection("sesions").insertOne({token, userID: user._id})
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



const port=process.env.PORTA || 5007
app.listen(port,()=>console.log(`Servidor em pé na porta ${port}`))
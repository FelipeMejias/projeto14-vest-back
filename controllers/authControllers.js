import db from '../db.js'
import joi from 'joi'
import bcrypt from 'bcrypt'
import {v4 as uuid} from 'uuid'
export async function login (req, res){
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
}
export async function cadastro (req, res){
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
}
import {login,cadastro} from '../controllers/authControllers.js'

import {Router} from 'express'

const authRouter=Router()

authRouter.post("/sign-in", login)
authRouter.post("/sign-up", cadastro)


export default authRouter
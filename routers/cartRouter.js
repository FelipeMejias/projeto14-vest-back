import { postCarrinho, getCarrinho, deleteCarrinho , getCarrinhoPorId} from '../controllers/cartControllers.js'

import {Router} from 'express'

const cartRouter=Router()

cartRouter.get('/carrinho/:idItem', getCarrinhoPorId)
cartRouter.delete('/carrinho/:idItem', deleteCarrinho)
cartRouter.get('/carrinho', getCarrinho)
cartRouter.post('/carrinho', postCarrinho)


export default cartRouter
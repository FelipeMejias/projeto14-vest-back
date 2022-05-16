import {postItens, getItens,getItemPorId,getItemPorPalavra} from '../controllers/itemsController.js'

import {Router} from 'express'

const itemsRouter=Router()

itemsRouter.post('/itens', postItens)
itemsRouter.get('/itens', getItens)
itemsRouter.get('/itens/:idItem', getItemPorId)
itemsRouter.get('/busca/:palavra', getItemPorPalavra)


export default itemsRouter
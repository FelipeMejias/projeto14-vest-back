import db from '../db.js'
export async function postCarrinho(req,res){
    const {token}=req.headers
    const body=req.body
    delete body._id
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        await db.collection('carrinho').insertOne({...body,usuario:usuario.email})
        res.sendStatus(200)

    }catch(e){res.status(499).send(e)}
}
export async function getCarrinho(req,res){
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
}
export async function deleteCarrinho (req,res){
    const {token}=req.headers
    const {idItem}=req.params
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        const item=await db.collection('carrinho').deleteOne({usuario:usuario.email,id:idItem})
        res.sendStatus(200)

    }catch{res.sendStatus(499)}
}
export async function getCarrinhoPorId(req,res){
    const {token}=req.headers
    const {idItem}=req.params
    try{
        const sessao =await db.collection('sesions').findOne({token})
        const usuario =await db.collection('users').findOne({email:sessao.userID})
        const item=await db.collection('carrinho').findOne({usuario:usuario.email,id:idItem})
        if(item){return res.send(true)}
        res.send(false)

    }catch{res.sendStatus(499)}
}
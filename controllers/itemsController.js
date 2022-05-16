import db from '../db.js'

export async function postItens (req,res){
    const body=req.body
    const {nome}=req.body
    try{
        await db.collection('itens').insertOne({...body,id:nome.split(' ').join('')})
        res.sendStatus(200)
    }catch{res.sendStatus(499)}
}
export async function getItens (req,res){

    try{
        const lista =await db.collection('itens').find(req.query).toArray()
        res.send(lista)
    }catch{res.sendStatus(499)}
}
export async function getItemPorId(req,res){
    const id=req.params.idItem
    
    try{
        const item =await db.collection('itens').findOne({id})
        res.send(item)
    }catch{res.sendStatus(499)}
}
export async function getItemPorPalavra (req,res){
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
}
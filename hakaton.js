const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bodyParser = require('body-parser')
const path = require("path")
const fs = require("fs")
const someStatic = require('./static')
const botStart = require("./bot-main.js")

const urlencodedParser = bodyParser.urlencoded({ extended: false })

let port = process.env.PORT;

if (port == null || port == "") {
  port = 8000;
}

const routerPath = path.join(__dirname, "router")

let sendFile = require( `${routerPath}/sendFile.js` )

let users = null
let products = null

async function startServerAndBot(){
  await mongoose.connect( someStatic.mongoConnectUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useFindAndModify: false,
  }).then( console.log("Mongo connected") ).catch( err=> console.log(err) )

  users = await someStatic.user_schema
  products = await someStatic.product_schema

  app.listen(port, ()=>{ console.log(`Server working on port ${port}`) })
  botStart(users, products)
  console.log(users)
}


app.use( urlencodedParser )
app.use( bodyParser.json() )

app.use( sendFile )

app.get("/", (req, res)=>{
  res.sendFile(`${__dirname}/public/html/index.html`)
})


app.get("/market", (req, res)=>{
  res.sendFile(`${__dirname}/public/html/market.html`)
})

app.get("/products", async (req, res)=>{
  let prod = await products.find({})
  res.json(prod)
})

app.post("/products", async (req, res)=>{
  if ( !req.body.link || req.body.link.length == 0){
    res.json([])
    return
  }

  let prod = await products.find({ _id: { $in: req.body.link } })
  res.json(prod)
})

app.get("/basket", async (req, res)=>{
  let user = await users.findOne({ _id: "617d613e243bdbd090843ad1" }, { "basket": 1, "_id": 0 })

  res.json(user.basket)
})

app.post("/basketChange", async (req, res)=>{
  if( req.body.productsIds.length == 0 ){
    res.sendStatus(404)
    return
  }

  let update = {}

  switch (req.body.do) {
    case "add":
      update.$push = { basket: { $each: req.body.productsIds } }
    break

    case "remove":
      update.$pull = { basket: { $in: req.body.productsIds } }
    break
  }

  let user = await users.findOneAndUpdate({ _id: "617d613e243bdbd090843ad1" }, update)

  if ( user ){ res.sendStatus(200) }
  else{ res.sendStatus(404) }
})

app.post("/updateBasket", async (req, res)=>{
  if ( !req.body.newBasket ){
    res.sendStatus(404)
    return
  }

  let user = await users.findOneAndUpdate({ _id: "617d613e243bdbd090843ad1" }, {
    $set: { basket: req.body.newBasket }
  })

  if ( user ){ res.sendStatus(200) }
  else{ res.sendStatus(404) }
})

app.get("/account", async (req, res)=>{
  res.sendFile(`${__dirname}/public/html/account.html`)
})

app.post("/getUser", async (req, res)=>{
  let user = await users.findOne({ _id: req.body.id })

  if( !user || !user._id ){
    res.json({ ok: false })
    return
  }

  res.json(user)
})

startServerAndBot()

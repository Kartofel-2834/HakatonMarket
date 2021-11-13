const express = require("express")
const path = require("path")

const router = express.Router()
const someStatic = require('../static')

router.get("/file", (req, res)=>{
  res.sendFile( path.join(someStatic.publicPath, req.query.path) )
})

module.exports = router

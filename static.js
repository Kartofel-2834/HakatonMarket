const mongoose = require("mongoose")
const path = require("path")

const staticData = {
  tg_token: "2035665813:AAF7d1EHy0eiV8SyYiBaTLnvibYaoWx53ag",

  mongoConnectUrl: "mongodb+srv://Kurban:kamal.chuchmek123@cluster0.gqpye.mongodb.net/market-place",

  publicPath: path.join(__dirname, "public"),

  smiles: {
    cross: "\u274c",
    backArrow: "\u2b05\ufe0f",
    nextArrow: "\u27a1\ufe0f",
  },

  user_schema: mongoose.model("users", {
    name:{
      type: String,
      required: true,
    },
    password:{
      type: String,
      required: true,
    },
    chat_id:{
      type: Number,
      required: true
    },

    products:{
      type: Array,
      required: true
    },

    basket: {
      type: Array,
      required: true
    },
  }),

  product_schema: mongoose.model("products", {
    name:{
      type: String,
      required: true,
    },
    price:{
      type: String,
      required: true,
    },
    description:{
      type: String,
      required: true
    },
    category:{
      type: String,
      required: true,
    },
    owner_id:{
      type: String,
      required: true
    },
  }),
}

module.exports = staticData

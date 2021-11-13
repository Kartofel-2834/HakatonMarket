const fs = require("fs")
const path = require("path")

const staticData = require("./static.js")
const MultiPageMessage = require("./multi-page-message.js")
const mongoose = require("mongoose")

const TelegramBot = require('node-telegram-bot-api')
const token = staticData.tg_token

let users = null
let bot = null

const commands = ["/my_products", "/basket", "/start"]
let session = {}

setInterval(()=>{
  for ( let user in session ){
    if ( session[user].messages ){
      session[user].messages = session[user].messages.filter( ( m )=>{
        return (new Date() - m.date) < 1800000
      })
    }
  }
}, 600000);

module.exports = start

function start(usersData, productsData){
  users = usersData
  products = productsData

  bot = new TelegramBot(token, {
    polling: true,
    filepath:false,
  })

  setBotListeners(bot)
}


function setBotListeners(bot){
  bot.onText(/\/start/, async (msg)=>{
    let text = "Это телеграм бот нашего маркетплейса.\n\n"
    text += "Отправьте сообщение с названием интересующего вас товара или воспользуйтесь одной из следующих команд:\n\n"
    text += "/my_products - список выставленных вами на продажу продуктов\n\n"
    text += "/basket - список добавленных вами в корзину продуктов\n"

    bot.sendMessage(msg.chat.id, text)
  })

  bot.onText(/\/my_products/, async (msg)=>{
    bot.sendMessage(msg.chat.id, "Посмотреть результаты", {
      reply_markup: { inline_keyboard: [
        [{ text: "Посмотреть", callback_data: "makeMultiPageMessage" }]
      ]}
    })
  })

  bot.onText(/\/basket/, async (msg)=>{
    bot.sendMessage(msg.chat.id, "Посмотреть результаты", {
      reply_markup: { inline_keyboard: [
        [{ text: "Посмотреть", callback_data: "basketMessage" }]
      ]}
    })
  })

  bot.on("message", async (msg)=>{
    console.log(`${msg.from.first_name} ${msg.from.last_name} - ${msg.text}`)
    if ( commands.indexOf(msg.text) != -1 ){ return }

    let listener = "search"

    if ( session[msg.chat.id] ){
      listener = session[msg.chat.id].listener
    }

    listener = listener.split("=")
    listener = {
      req: listener[0],
      data: listener[1] ? listener[1] : null
    }

    switch ( listener.req ) {
      case "search":
        bot.sendMessage(msg.chat.id, "Посмотреть результаты поиска", {
          reply_markup: { inline_keyboard: [
            [{ text: "Посмотреть", callback_data: `searchCallback=${ msg.text }` }]
          ]}
        })
      break

      case "description":
      case "price":
      case "name":
        editProductInfo(bot, msg, listener)
      break
    }
  })


  bot.on("callback_query", async (query)=>{
    let msg = query.message
    let queryParsed = query.data.split("=")

    queryParsed = {
      req: queryParsed[0],
      data: queryParsed[1] ? queryParsed[1] : null,
      product_id: queryParsed[2] ? queryParsed[2] : null,
    }

    switch ( queryParsed.req ) {
      case "searchCallback":
        let tester = queryParsed.data.split(" ").map( e => `(?=.*${e})`).join('')
        tester = new RegExp( tester, "i" )
        let prodFinded = await products.find({ name: tester })

        makeMultiPageMessage(bot, msg, prodFinded)
      break

      case "basketMessage":
        sendMultiPageMessage(bot, msg, "basket")
      break

      case "makeMultiPageMessage":
        sendMultiPageMessage(bot, msg, "products")
      break

      case "scroll":
        scrollPageMessage(bot, msg, queryParsed)
      break

      case "deleteMsg":
        deletePageMessage(bot, msg)
      break

      case "id":
        sendProductInfo(bot, msg, queryParsed.data)
      break

      case "changeProduct":
        setProductChangeListener(bot, msg, queryParsed)
      break

      case "addToBasket":
      case "pullFromBasket":
        addOrPullFromBasket(bot, msg, queryParsed)
      break
    }
  })

}

//--------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------

async function makeMultiPageMessage(bot, msg, productArr){
  let newMessage = new MultiPageMessage(msg.message_id, productArr)

  if ( session[String(msg.chat.id)] ){
    session[String(msg.chat.id)].messages.push( newMessage )
  }
  else{
    session[String(msg.chat.id)] = {
      messages: [ newMessage ],
      listener: "search"
    }
  }

  bot.editMessageText( newMessage.pages[0].text, {
    parse_mode: "HTML",
    reply_markup: newMessage.pages[0].markup,
    message_id: msg.message_id,
    chat_id: msg.chat.id
  })
}

async function sendMultiPageMessage(bot, msg, arrayName){
  //let user = await users.findOne({ chat_id: msg.chat.id })
  let userAnotherOne = await users.findOne({ chat_id: 874541511 })

  if ( !userAnotherOne || !userAnotherOne.basket ){
    bot.sendMessage(msg.chat.id, "Вам следует зарегестрироваться")
    return
  }

  let prod = await products.find({ _id: { $in: userAnotherOne[arrayName] } })

  makeMultiPageMessage(bot, msg, prod)
}

function setProductChangeListener(bot, msg, queryParsed){
  let listenerData = `${ queryParsed.data }=${queryParsed.product_id}`

  if ( !session[msg.chat.id] ){
    session[msg.chat.id] = { messages: [], listener: listenerData }
  }
  else{
    session[msg.chat.id].listener = listenerData
  }

  bot.deleteMessage(msg.chat.id, msg.message_id)

  let text = "Введите новое имя продукта ( 100 символов макс. )"
  switch (queryParsed.data) {
    case "description": text = "Введите новое описание продукта ( 500 символов макс. )"; break
    case "price": text = "Введите новую цену продукта ( 100 символов макс. )"; break
  }

  bot.sendMessage(msg.chat.id, text)
}


function scrollPageMessage(bot, msg, queryParsed){
  let userMessages = session[msg.chat.id] ? session[msg.chat.id].messages : null

  if ( !userMessages ){
    bot.deleteMessage(msg.chat.id, msg.message_id); return
  }

  let pageMessageInd = searchMessageById(msg.message_id, userMessages)
  let page = null

  if( pageMessageInd == null || pageMessageInd == -1 ){
    bot.deleteMessage(msg.chat.id, msg.message_id); return
  }

  switch ( queryParsed.data ) {
    case "+": page = userMessages[pageMessageInd].nextPage(); break
    case "-": page = userMessages[pageMessageInd].prevPage(); break
  }

  if ( !page ){ console.log("cum"); return }

  bot.editMessageText( page.text, {
    parse_mode: "HTML",
    reply_markup: page.markup,
    message_id: msg.message_id,
    chat_id: msg.chat.id
  })
}

function deletePageMessage(bot, msg){
  let chatUserMessages = session[msg.chat.id] ? session[msg.chat.id].messages : null

  if ( !chatUserMessages ){
    bot.deleteMessage(msg.chat.id, msg.message_id)
    return
  }

  let pageMsgInd = searchMessageById(msg.message_id, chatUserMessages)
  chatUserMessages.splice(pageMsgInd, 1)

  bot.deleteMessage(msg.chat.id, msg.message_id)
}

async function sendProductInfo(bot, msg, id){
  //let user = await users.findOne({ chat_id: msg.chat.id })
  let user = await users.findOne({ chat_id: 874541511 })
  let answer = await products.findOne({ _id: id })

  if ( !answer || !answer._id ){
    bot.sendMessage(msg.chat.id, "Товар не найден")
    return
  }

  answer.name = answer.name.slice(0, 100)
  answer.price = answer.price.slice(0, 100)
  answer.description = answer.description.slice(0, 700)

  let posterPath = path.join(__dirname, "public", "product_posters", `${String(answer._id)}.jpg`)
  let markup = {}

  if (user._id == answer.owner_id){
    markup.inline_keyboard = [
      [{ text: "Изменить название", callback_data: `changeProduct=name=${ answer._id }` }],
      [{ text: "Изменить описание", callback_data: `changeProduct=description=${ answer._id }` }],
      [{ text: "Изменить цену", callback_data: `changeProduct=price=${ answer._id }` }],
    ]
  }
  else {
      if( user.basket.indexOf( String(answer._id) ) >= 0 ){
        markup.inline_keyboard = [
          [{ text: "Удалить из корзины", callback_data: `pullFromBasket=${ user._id }=${ answer._id }` }]
        ]
      }
      else {
        markup.inline_keyboard = [
          [{ text: "Добавить в корзину", callback_data: `addToBasket=${ user._id }=${ answer._id }` }]
        ]
      }
  }

  fs.readFile( posterPath, (err, data)=>{
    if (err){ console.log(err); return }

    bot.sendPhoto( msg.chat.id, data, {
      caption: `<i><b>${ answer.name }</b></i>\n\n${ answer.description }\n\n<b>ЦЕНА: ${ answer.price }</b>`,
      parse_mode: "HTML",
      reply_markup: markup,
    })
  })
}

async function editProductInfo(bot, msg, listener){
  let changes = { $set:{} }

  changes.$set[listener.req] = msg.text

  let changedProd = await products.findOneAndUpdate({ _id: listener.data }, changes)

  if( !changedProd ){ bot.sendMessage(msg.chat.id, "Не удалось изменить продукт") }
  else{ bot.sendMessage(msg.chat.id, "Изменения были внесены") }

  session[msg.chat.id].listener = "search"
}

async function addOrPullFromBasket(bot, msg, queryParsed){
  let markup = { inline_keyboard: [] }
  let req = {}
  req[ queryParsed.req == "addToBasket" ? "$push" : "$pull" ] = { basket: queryParsed.product_id }

  let chatuser = await users.findOneAndUpdate({ chat_id: 874541511 }, req)
  //let chatuser = await users.findOneAndUpdate({ chat_id: msg.chat.id }, req)

  if ( queryParsed.req == "addToBasket" ){
    markup.inline_keyboard.push(
      [{ text: "Удалить из корзины", callback_data: `pullFromBasket=${ chatuser._id }=${ queryParsed.product_id }` }]
    )
  }
  else{
    markup.inline_keyboard.push(
      [{ text: "Добавить в корзину", callback_data: `addToBasket=${ chatuser._id }=${ queryParsed.product_id }` }]
    )
  }

  bot.editMessageReplyMarkup(markup, { chat_id: msg.chat.id, message_id: msg.message_id })
}

function searchMessageById(id, chatUserMsgLink){
  return chatUserMsgLink.map( msgObj => msgObj.id ).indexOf(id)
}

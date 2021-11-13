const staticData = require("./static.js")

class MultiPageMessage {
  constructor(msgId, prodArr) {
    this.pageNow = 0,
    this.prodArr = prodArr,
    this.pages = [],
    this.id = msgId
    this.date = new Date()

    this.setPages()
  }

  nextPage(){
    if( this.pageNow < this.pages.length-1 ){
      this.pageNow++
      return this.pages[ this.pageNow ]
    }

    return null
  }

  prevPage(){
    if ( this.pageNow > 0 ){
      this.pageNow--
      return this.pages[ this.pageNow ]
    }

    return null
  }

  setPages(){
    if ( this.prodArr.length == 0 ){
      this.pages = [{ text: "Ничего не найдено", markup: {} }]
      return
    }
    let pageBuff = []

    this.prodArr.forEach( (p, i)=>{
      if ( pageBuff.length == 10 ){
        this.pages.push( pageBuff )
        pageBuff = []
      }

      pageBuff.push(p)
    })

    if ( pageBuff.length > 0 ) { this.pages.push( pageBuff ) }

    this.mapPages()

    delete this.prodArr
  }

  mapPages(){
    this.pages = this.pages.map( (page, i)=>{
      return this.convertToTextAndMarkup(page, i, this.pages.length)
    })
  }

  convertToTextAndMarkup(page, ind, pageCount){
    let text = `Страница ${ind+1} из ${ pageCount }\n`
    let keyboard = []
    let buttonRow = []

    page.forEach( (p, i)=>{
      text += `\n<b>${i+1}.</b>  <i><b>${p.name}</b></i>`

      if ( buttonRow.length == 5 ){
        keyboard.push(buttonRow)
        buttonRow = []
      }

      buttonRow.push({ text: `${i+1}`, callback_data: `id=${p._id}` })
    })

    if ( buttonRow.length > 0 ){ keyboard.push(buttonRow) }

    keyboard.push( this.messageControlButtonRow(ind, pageCount) )

    return {
      text: text,
      markup: { inline_keyboard: keyboard }
    }
  }

  messageControlButtonRow(ind, pageCount){
    let answer = [{ text: staticData.smiles.cross, callback_data: "deleteMsg" }]

    if ( ind > 0 ){
      answer.unshift({ text: staticData.smiles.backArrow, callback_data: "scroll=-" })
    }

    if (ind < pageCount-1){
      answer.push({ text: staticData.smiles.nextArrow, callback_data: "scroll=+" })
    }

    return answer
  }
}

module.exports = MultiPageMessage

import CategoryButton from '/file?path=js/categoryButton.js'
import ProductSquare from '/file?path=js/productSquare.js'
import BasketMenu from '/file?path=js/basketMenu.js'

Array.prototype.add = function(el){
  if( this.indexOf(el) == -1 ){ this.push(el) }
}

Array.prototype.remove = function(el){
  this.splice( this.indexOf(el), 1 )
}

const App = {
  data(){
    return {
      category: "all",
      productsSorted: [],
      productsNotSearched: [],
      productsAll: [],
      basket: [],
      searchFocused: false,
      basketMenuOpened: false,
    }
  },

  async created(){
    let res = await fetch("/products")
    let basket = await fetch("/basket")

    res = await res.json()
    basket = await basket.json()

    if( basket && basket.length > 0 ){
      let fullBasket = await postJson("/products", { link: basket })

      fullBasket = await fullBasket.json()

      this.basket = fullBasket && fullBasket.length > 0 ? fullBasket : []
    }

    if (res && res.length > 0){
      this.productsAll = res
      this.productsSorted = res
      this.productsNotSearched = res
    }

    window.onkeyup = (e)=>{
      if ( e.keyCode == 13 && this.searchFocused ){
        this.search()
      }
    }
  },

  components: {
    "category-button": CategoryButton,
    "product-square": ProductSquare,
    "basket-menu": BasketMenu,
  },

  methods:{
    openBasketMenu(){ this.basketMenuOpened = true },
    closeBasketMenu(){ this.basketMenuOpened = false },

    changeCategory(category){
      this.category = category

      if (category == "all"){
        this.productsSorted = Array.from( this.productsAll )
      }
      else{
        this.productsSorted = this.productsAll.filter( p => p.category == category  )
      }

      this.productsNotSearched = this.productsSorted
    },

    search(){
      let searchField = document.getElementById('searchField')
      let tester = searchField.value.split(" ").map( e => `(?=.*${e})`).join('')
      tester = new RegExp( tester, "i" )
      this.productsSorted = this.productsNotSearched.filter( p => tester.test(p.name) )
    },

    searchFocus(){ this.searchFocused = true },
    searchBlur(){ this.searchFocused = false },

    updateBasket( basket ){
      this.basket = basket
      postJson("/updateBasket", { newBasket: basket.map( e => e._id ) })
    },

    addToBasket(p){
      this.basket.add(p);
      postJson("/basketChange", { productsIds: [ p._id ], do: "add" })
    },

    deleteFromBasket(p){
      this.basket.remove(p)
      postJson("/basketChange", { productsIds: [ p._id ], do: "remove" })
    }
  }
}

async function postJson(url, body){
  let res = await fetch(url, {
    headers:{ 'Content-Type': 'application/json;charset=utf-8' },
    method: "POST",
    body: JSON.stringify(body)
  })

  return res
}

let app = Vue.createApp(App)
let vm = app.mount("#app")

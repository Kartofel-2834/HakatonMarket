import AccountProductSquare from '/file?path=js/AccountProductSquare.js'

Array.prototype.add = function(el){
  if( this.indexOf(el) == -1 ){ this.push(el) }
}

Array.prototype.remove = function(el){
  this.splice( this.indexOf(el), 1 )
}

const urlParams = new URLSearchParams(window.location.search);

async function postJson(url, body){
  let res = await fetch(url, {
    headers:{ 'Content-Type': 'application/json;charset=utf-8' },
    method: "POST",
    body: JSON.stringify(body)
  })

  return res
}

const App = {
  data(){ return {
    user: {},
    products: [],
    basketNotSearched: [],
    basket: [],
    searchFocused: false,
  } },

  components: {
    "account-product-square": AccountProductSquare,
  },

  methods:{
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
    },

    searchFocus(){ this.searchFocused = true },
    searchBlur(){ this.searchFocused = false },

    search(){
      let searchField = document.getElementById('searchField')
      let tester = searchField.value.split(" ").map( e => `(?=.*${e})`).join('')

      tester = new RegExp( tester, "i" )
      this.basket = this.basketNotSearched.filter( p => tester.test(p.name) )
    },
  },

  async created(){
    let user = await postJson("/getUser", { id: urlParams.get("id") })
    user = await user.json()

    if (user && user._id){
      this.user = user
    } else {
      return
    }

    let basket = await postJson("/products", { link: user.basket })
    basket = await basket.json()


    if(basket.length && basket.length > 0){
      this.basket = basket
      this.basketNotSearched = basket
    }

    window.onkeyup = (e)=>{
      if ( e.keyCode == 13 && this.searchFocused ){
        this.search()
      }
    }
  }
}


let app = Vue.createApp(App)
let vm = app.mount("#app")

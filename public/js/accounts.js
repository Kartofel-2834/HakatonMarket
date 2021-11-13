import ProductSquare from '/file?path=js/productSquare.js'


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
    basket: [],
  } },

  components: {
    "product-square": ProductSquare,
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
    }
  },

  async created(){
    let user = await postJson("/getUser", { id: urlParams.get("id") })
    user = await user.json()

    if (user && user._id){
      this.user = user
    } else {
      return
    }

    let myProducts = await postJson("/products", { link: user.products })
    myProducts = await myProducts

    if(myProducts.length && myProducts.length > 0){ this.products = myProducts }


    let basket = await postJson("/products", { link: user.basket })
    basket = await basket.json()


    if(basket.length && basket.length > 0){ this.basket = basket }
  }
}


let app = Vue.createApp(App)
let vm = app.mount("#app")

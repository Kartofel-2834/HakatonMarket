const urlParams = new URLSearchParams(window.location.search);
const query = {
  userId: urlParams.get("user_id"),
  product_id: urlParams.get("product_id")
}

Array.prototype.add = function(el){
  if( this.indexOf(el) == -1 ){ this.push(el) }
}

Array.prototype.remove = function(el){
  this.splice( this.indexOf(el), 1 )
}

const App = {
  data(){
    return {
      user: null,
      product: null,
      ownerName: null,
      basket: [],
      inBasket: false,
    }
  },

  methods: {
    checkProdInBasket(){
      this.inBasket = this.basket.map(p => p._id).indexOf(this.product._id) == -1
    },

    async addToBasket(){
      this.basket.add(this.product);
      await postJson("/basketChange", { productsIds: [ this.product._id ], do: "add" })
      this.checkProdInBasket()
    },

    async deleteFromBasket(){
      this.basket.remove(this.product)
      await postJson("/basketChange", { productsIds: [ this.product._id ], do: "remove" })
      this.checkProdInBasket()
    },
  },

  async created(){
    let product = await postJson("/products", { link: [ query.product_id ] })
    product = await product.json()

    if( product.length && product.length > 0 ){ this.product = product[0] }

    if ( !query.userId ){ return }

    let user = await postJson("/getUser", { id: query.userId })
    user = await user.json()

    if( user && user._id ){ this.user = user }
    else{ return }

    let basket = await postJson("/products", { link: user.basket })
    basket = await basket.json()

    if( basket.length && basket.length > 0 ){ this.basket = basket }

    let productOwnerName = await postJson("/onlyName", { id: this.product.owner_id })
    this.ownerName = await productOwnerName.json()
    this.ownerName = this.ownerName.name

    this.checkProdInBasket()
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

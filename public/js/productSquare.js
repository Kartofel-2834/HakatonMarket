const AddToBasketButton = {
  props:{
    "product": { type: Object },
    "basket": { type: Array, default: [] },
    "add": { type: Function, default: [] },
    "remove": { type: Function, default: [] },
  },

  methods:{
    clickEvent(){
      let ev = this.basket.indexOf( this.product._id ) != -1 ? 'remove' : 'add'

      this[ev](this.product)
    }
  },

  computed:{
    imgSrc(){
      if( this.basket.indexOf( this.product._id ) != -1 ){
        return '/file?path=icons/basket_remove.svg'
      }

      return '/file?path=icons/basket_add.svg'
    }
  },

  template: `
    <img class="product_basket" :src="imgSrc" @click="clickEvent">
  `
}

const ProductSquare = {
  props: {
    "product": { type: Object },
    "basket": { type: Array, default: [] },
    "addtobasketmethod": { type: Function, default: ()=>{} },
    "removefrombasketmethod": { type: Function, default: ()=>{} },
  },

  components: { "add-to-basket-button": AddToBasketButton },

  template: `
    <div class="product_info_inner">
      <div class="product_preview_inner">
        <img :src="'/file?path=product_posters/' + product._id + '.jpg'" class="product_preview">
      </div>

      <div class="product_bottom_inner">
        <div class="space_between align">
          <a
            :href="'http://localhost:8000/productInfo?user_id=617d613e243bdbd090843ad1&product_id=' + product._id"
            class="product_name slide_underline"
          >{{ product.name }}</a>
          <add-to-basket-button
            :basket="basket"
            :product="product"
            :add="addtobasketmethod"
            :remove="removefrombasketmethod"
          ></add-to-basket-button>
        </div>

        <div class="product_price">Цена: {{ product.price }}</div>
      </div>
    </div>
  `
}


export default { productSquare: ProductSquare, basketButton: AddToBasketButton }

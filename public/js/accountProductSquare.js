import ProductSquare from '/file?path=js/productSquare.js'

const AccountProductSquare = {
  props: {
    "product": { type: Object, default: {} },
    "basket": { type: Array, default: [] },
    "addtobasketmethod": { type: Function, default: ()=>{} },
    "removefrombasketmethod": { type: Function, default: ()=>{} },
  },

  components: {
    "basket-button": ProductSquare.basketButton
  },

  template: `
    <div class="profile_product_info_inner">
      <div class="profile_product_image_inner align">
        <img :src="'/file?path=product_posters/' + product._id + '.jpg'" class="profile_product_image">
      </div>

      <div class="profile_product_text_inner">
        <div class="space_between align">
          <div class="profile_product_name column">{{ product.name }}</div>

          <basket-button
            :basket="basket"
            :product="product"
            :add="addtobasketmethod"
            :remove="removefrombasketmethod"
          ></basket-button>
        </div>

        <div class="profile_product_price">{{ product.price }}</div>
      </div>
    </div>
  `,
}

export default AccountProductSquare

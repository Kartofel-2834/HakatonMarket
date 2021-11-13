function promiseTimeout(cb, timeout){
  return new Promise( (res, rej) => {
    setTimeout(() => {
      cb(); res()
    }, timeout)
  })
}

Array.prototype.add = function(el){
  if( this.indexOf(el) == -1 ){ this.push(el) }
}

Array.prototype.remove = function(el){
  this.splice( this.indexOf(el), 1 )
}

Array.prototype.has = function(el){
  return this.indexOf(el) != -1
}

const BasketLink = {
  props: {
    "product": { type: Object },
    "ableclickevent": { type: Function, default: ()=>{} },
    "disableclickevent": { type: Function, default: ()=>{} }
  },

  data(){ return { hover: false, disabled: false } },

  methods:{
    hoverOn(){ this.hover = true },
    hoverOff(){ this.hover = false },
    buttonClickEvent(){
      this.disabled = !this.disabled

      if( this.disabled ){ this.disableclickevent(this.product) }
      else{ this.ableclickevent(this.product) }
    }
  },

  template: `
    <div class="basket_menu_link space_between align" @mouseover="hoverOn" @mouseout="hoverOff">
      <div class="basket_menu_link_text">{{ product.name }} - {{ product.price }}</div>
      <img
        src="/file?path=icons/plus_circle.svg"
        class="basket_menu_link_button"
        :class="{ 'hide_opacity': !hover, 'basket_menu_link_button_disabled': disabled }"
        @click="buttonClickEvent"
      >
    </div>
  `
}

const BasketMenu = {
  props: {
    "openedflag": { type: Boolean, default: false },
    "closemenumethod": { type: Function, default: ()=>{} },
    "updatebasketmethod": { type: Function, default: ()=>{} },
    "basket": { type: Array, default: [] },
  },

  data(){
    return {
      updatedBasket: Array.from(this.basket),
      blackholeClasses: [],
      menuClasses: [ "basket_menu_closed" ],
    }
  },

  methods: {
    closeMenu(e){
      let pathElIds = e.path.map( e => e.id )

      if( pathElIds.has("basketMenu") && !pathElIds.has("basketMenuButton") ){
        return
      }

      if( this.updatedBasket.length != this.basket.length ){
        this.updatebasketmethod(this.updatedBasket)
      }

      this.closemenumethod()
    },

    addProductToBasket(p){ this.updatedBasket.add(p) },
    removeProductFromBasket(p){ this.updatedBasket.remove(p) }
  },

  computed:{
    menuConditionController(){
      if (this.openedflag){
        this.blackholeClasses.remove("hide");
        promiseTimeout(()=>{
          this.blackholeClasses.remove("blackhole_hided")
          this.menuClasses.remove("basket_menu_closed")
        }, 250)
      }
      else{
        this.blackholeClasses.add("blackhole_hided")
        this.menuClasses.add("basket_menu_closed")
        promiseTimeout(()=>{ this.blackholeClasses.add("hide") }, 250)
      }

      return "hide"
    },

    basketWasUpdated(){
      this.updatedBasket = Array.from(this.basket)
      return 'hide'
    }
  },

  components: { "basket-link": BasketLink },

  template: `
    <div :class="menuConditionController"></div>
    <div :class="basketWasUpdated"></div>

    <div class="blackhole row_reverse" :class="blackholeClasses" @click="closeMenu">
      <div class="basket_menu column" :class="menuClasses" id="basketMenu">
        <div class="space_between align basket_menu_header">
          <div class="basket_menu_header_text">Корзина</div>
          <div
            id="basketMenuButton"
            class="header_button shopping_basket_button basket_menu_button"
            @click="closeMenu"
          ></div>
        </div>

        <basket-link
          v-for="p in basket"
          :disableclickevent="removeProductFromBasket"
          :ableclickevent="addProductToBasket"
          :product="p"
        ></basket-link>
      </div>
    </div>
  `
}

export default BasketMenu

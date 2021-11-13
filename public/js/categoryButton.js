const CategoryButton = {
  props: {
    "id": { type: String, default: "category" },
    "categorychangemethod": { type: Function, default: ()=>{} },
    "category": { type: String, default: "all" },
  },

  data(){
    return {
       active: false,
       idCopy: this.id,

       categoryCopy: this.category,

       categories: [
          { text: "Все категории", catName: "all" },
          { text: "Зерновые культуры", catName: "wheat" },
          { text: "Скот", catName: "cattle" },
          { text: "Рыбная продукция", catName: "fish" },
          { text: "Птицеводческая продукция", catName: "bird" },
          { text: "Молочная продукция", catName: "milk" },
          { text: "Цветы", catName: "flower" },
          { text: "Фрукты", catName: "fruit" },
          { text: "Овощи", catName: "vegetable" },
       ]
     }
  },

  computed:{
    buttonId(){
      this.idCopy = this.active ? 'categoryButtonActive' : 'category'
      return this.idCopy
    }
  },

  methods: {
    buttonClickEv(){ this.active = !this.active },
    categoryChanger(catName){
      this.categorychangemethod(catName)
      this.categoryCopy = catName
    }
  },

  created(){
    window.onclick = (e)=>{
      if ( e.target.id == this.idCopy ){ return }

      for (let el of e.path){
        if( el.id == "categoriesMenu" ){ return }
      }

      this.active = false
    }
  },

  template: `
    <div class="search_buttons_inner center">
      <div @click="buttonClickEv" :id="buttonId" class="search_inner_button"></div>
      <div class="categories_menu column" :class="{ 'hide_scale_y': !active }" id="categoriesMenu">
        <div class="category_link_header">Категории:</div>

        <label v-for="cat in categories">
          <div
            @click="categoryChanger(cat.catName)"
            class="category_link_el space_between"
            :class="{ 'category_link_el_active': categoryCopy == cat.catName }"
          >{{ cat.text }}</div>
          <input type="text" class="hide" :value="cat.catName">
        </label>


      </div>
    </div>
  `
}

export default CategoryButton

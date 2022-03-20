import Vue from 'vue'
import App from './App.vue'

import VueI18n from 'vue-i18n'
import VueResource from 'vue-resource'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'

import translations from './translation'

Vue.config.productionTip = false

function getLanguage() {
  switch (navigator.language) {
    case 'zh-TW':
      return 'cn'
    case 'zh-CN':
      return 'cn'
    case 'ar':
      return 'ar'
    case 'pl':
      return 'pl'
    default:
      return 'en'
  }
}

Vue.use(VueI18n)
Vue.use(VueResource)
Vue.use(Buefy)

const i18n = new VueI18n({
  locale: getLanguage(),
  fallbackLocale: 'en',
  messages: translations,
})
console.log(i18n)

new Vue({
  i18n,
  render: h => h(App),
}).$mount('#app')

import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import '@/common/Icons.js'

Vue.config.productionTip = false

var eventBus = new Vue()

new Vue({
  render: h => h(App),
}).$mount('#app')

export default eventBus
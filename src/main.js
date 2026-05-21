import Vue from 'vue'
if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/pyqzan/'}).then(function(r){console.log('SW registered:',r.scope)}).catch(function(e){console.error('SW failed:',e)})})}
import App from './App'
import './uni.promisify.adaptor'

import Api from './request/api'
Vue.prototype.$api = Api

import utils from './utils/index.js'
Vue.prototype.$util = utils

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()

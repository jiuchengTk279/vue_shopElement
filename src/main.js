// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import less from 'less'
import ElementUI, { Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import global from './assets/css/global.css'
import axios from 'axios'

Vue.use(ElementUI)
Vue.use(less)
Vue.use(global)
Vue.config.productionTip = false
//  配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  console.log(config)
  // 为请求头对象，添加Token验证的Authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 最后必须返回config
  return config
})
Vue.prototype.$http = axios
Vue.prototype.$message = Message

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router,
  components: { App },
  template: '<App/>'
})

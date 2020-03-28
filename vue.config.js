module.exports = {
    // 通过 chainWebpack 修改 webpack的默认配置
    chainWebpack: config => {
        // 修改生产环境的入口文件
        config.when(process.env.NODE_ENV === 'production', config => {
            config.entry('app').clear().add('./src/main-prod.js')
            config.set('externals', { 
                vue: 'Vue', 
                'vue-router': 'VueRouter', 
                axios: 'axios', 
                lodash: '_', 
                echarts: 'echarts', 
                nprogress: 'NProgress', 
                'vue-quill-editor': 'VueQuillEditor' 
            })
            config.plugin('html').tap(args => {
                args[0].isProd = true
                return args
            })
        })
        
        // 修改开发环境的入口文件
        config.when(process.env_NODE_ENV === 'development', config => {
            config.entry('app').clear().add('./src/main.js')
            config.plugin('html').tap(args => {
                args[0].isProd = false
                return args
            })
        })
    }
}
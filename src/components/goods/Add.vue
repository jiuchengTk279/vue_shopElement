<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

            <!-- 步骤条区域 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name='0'>
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader expand-trigger="hover" :options="cateList" v-model="addForm.goods_cat" :props="cateProps" @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name='1'>
                        <!-- 渲染表单的Item项 -->
                        <el-form-item v-for="item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item2" v-for="(item2, i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name='2'>
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name='3'>
                        <!-- action 表示图片要上传的后台API地址 -->
                        <!-- headers 设置上传的请求头部 -->
                        <el-upload
                            :action="uploadUrl"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture"
                            :headers="headerObj"
                            :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name='4'>
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品的按钮 -->
                        <el-button type="primary" class="btnAdd" @click="addGood">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 控制图片预览的对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewDialogVisible"
            width="50%">
            <img :src="previewPath"  alt="" class="previewImg"/>
        </el-dialog>
    </div>
</template>

<script>
// 引入lodash库
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        // 商品名称
        goods_name: '',
        // 商品价格
        goods_price: 0,
        // 商品重量
        goods_weight: 0,
        // 商品数量
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的介绍文本，也就是富文本编辑器的内容
        goods_introduce: '',
        // 商品的参数数组，包含动态参数和静态参数
        attrs: []
      },
      // 添加商品的表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      //  商品分类数据
      cateList: [],
      // 商品分类的配置选项
      cateProps: {
        // 展示的值
        label: 'cat_name',
        // 选中的值
        value: 'cat_id',
        // 层级嵌套
        children: 'children'
      },
      // 动态参数列表数据
      manyTableData: [],
      // 静态参数列表数据
      onlyTableData: [],
      // 上传图片的地址
      uploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览的路径
      previewPath: '',
      // 控制图片预览对话框的显示与隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.cateList = res.data
      // console.log(this.cateList)
    },
    // 级联选择器选中项变化时，会触发这个函数
    handleChange () {
      console.log(this.addForm.goods_cat)
      // 只能选中三级分类，长度不为3，那么就只能选中空数组，清空
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeTabLeave (activeName, oldActiveName) {
      // oldActiveName 是即将离开的标签页
      // activeName 是即将进入的标签页
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    // tab栏被选中的时候触发的函数
    async tabClicked () {
      // 当activeIndex的值为1的时候，说明进入的是动态参数面板
      if (this.activeIndex === '1') {
        // 发起获取动态参数的数据请求
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'many'}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表数据失败！')
        }

        console.log(res.data)
        // 将复选框数组进行空字符串切割
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        // 将响应获得的动态参数数据赋值给manyTableData
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 发起获取静态参数列表的数据请求
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: 'only'}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态参数列表数据失败！')
        }

        console.log(res.data)
        // 将响应获得的数据赋值给静态参数列表数据
        this.onlyTableData = res.data
      }
    },
    // 处理图片预览效果
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewDialogVisible = true
    },
    // 处理图片移除的操作
    handleRemove (file) {
      console.log(file)
      // 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从pics数组中，找到这个图片的对应索引值
      const i = this.addForm.pics.findIndex(x => x.index === filePath)
      // 调用数组的splice方法，把图片信息对象从pics数组中移除
      this.addForm.pics.splice(i, 1)
    },
    // 监听图片上传成功的事件
    handleSuccess (response) {
      console.log(response)
      // 拼接得到一个图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 将图片信息对象品push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
    },
    // 添加商品的方法
    addGood () {
      // 添加表单前的预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // 将goods_cat从数组转换为字符串，通过join('')方法，但是级联选择器的内容必须是数组，可以先将表单数据深拷贝一份，再将拷贝后的表单转换为字符串，不影响
        // 深拷贝采用的是 lodash 中的 cloonDeep(obj)
        const form = _.cloonDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数属性
        // 对manyTableData进行forEach遍历
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join('')
          }
          // 将newInfo添加到addForm.attrs属性中
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态参数属性
        // 对onlyTableData 进行forEach遍历
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          // 将newInfo 添加到 addForm.attrs属性中
          this.addForm.attrs.push(newInfo)
        })
        // 将addForm.attrs属性 赋值给深拷贝后的form表单的attrs属性
        form.attrs = this.addForm.attrs
        console.log(form)

        // 发起请求，添加商品
        // 商品的名称， 必须是唯一的
        const {data: res} = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }
        this.$message.success('添加商品成功！')
        // 添加成功后，跳转到商品列表页
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 计算分类的id值
    cateId() {
      // 如果分类的长度等于三，说明选中了三级分类
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>

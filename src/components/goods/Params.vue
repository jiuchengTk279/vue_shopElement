<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!--警告区域 -->
            <el-alert show-icon title="注意：只允许为第三级分类设置相关参数！"  type="warning" :closable="false"></el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader expand-trigger="hover" :options="cateList" v-model="selectedCateKeys" :props="cateProps" @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tan 页签区域 -->
            <el-tabs v-model="activeName"  @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTabData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand"></el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <!-- 操作列 -->
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTabData" border stripe>
                        <el-table-column type="expand"></el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      cateList: [],
      // 级联选择框的配置对象
      cateProps: {
        // 指定选项的值为选项对象的某个属性值
        value: 'cat_id',
        // 指定选项标签为选项对象的某个属性值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedCateKeys: [],
      // 选中的标签页
      activeName: 'many',
      // 动态参数
      manyTabData: [],
      // 静态属性
      onlyTabData: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const {data: res} = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      this.cateList = res.data
      console.log(this.cateList)
    },
    // 级联选择框选中项变化，会触发这个函数
    handleChange () {
      this.getParamsData()
    },
    // tab 页签点击事件的处理函数
    handleTabClick () {
      this.getParamsData()
      console.log(this.activeName)
    },
    // 获取参数的列表数据
    async getParamsData () {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        return
      }

      // 证明选中的是三级分类
      console.log(this.selectedCateKeys)

      // 根据所选分类的ID，和当前所处的面板，获取对应的参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }

      console.log(res.data)

      // 将数据挂载到不同的表格上
      if (this.activeName === 'many') {
        // 将数据挂载到动态参数上
        this.manyTabData = res.data
      } else {
        // 将数据挂载到静态属性上
        this.onlyTabData = res.data
      }
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回 true，否则返回 false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类 id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
</style>

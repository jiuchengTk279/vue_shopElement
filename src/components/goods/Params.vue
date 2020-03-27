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
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTabData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                          <template slot-scope="scope">
                            <!-- 循环渲染 tag 标签 -->
                            <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                            <!--输入的文本框 -->
                            <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <!-- 添加的按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                          </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <!-- 操作列 -->
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteDialog(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTabData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                          <template slot-scope="scope">
                            <!-- 循环渲染 tag 标签 -->
                            <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{ item }}</el-tag>
                            <!--输入的文本框 -->
                            <el-input
                                class="input-new-tag"
                                v-if="scope.row.inputVisible"
                                v-model="scope.row.inputValue"
                                ref="saveTagInput"
                                size="small"
                                @keyup.enter.native="handleInputConfirm(scope.row)"
                                @blur="handleInputConfirm(scope.row)">
                            </el-input>
                            <!-- 添加的按钮 -->
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                          </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteDialog(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数以及属性的对话框 -->
        <el-dialog
            :title="'添加' + titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="closeDialogVisible">
            <!-- 添加参数对话框的表单 -->
            <el-form :model="addRuleForm" :rules="addRules" ref="addRuleFormRef" label-width="100px">
              <el-form-item :label="titleText" prop="attr_name">
                <el-input v-model="addRuleForm.attr_name"></el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数以及属性的对话框 -->
        <el-dialog
          :title="'修改' + titleText"
          :visible.sync="editDialogVisible"
          width="50%"
          @close="editDialogClosed">
          <el-form :model="editRuleForm" :rules="editRules" ref="editRuleFormRef" label-width="100px">
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="editRuleForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
          </span>
        </el-dialog>
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
      onlyTabData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加对话框的表单对象
      addRuleForm: {
        // 参数名称
        attr_name: ''
      },
      // 添加对话框的表单验证规则对象
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 控制修改参数以及属性的对话框的显示与隐藏
      editDialogVisible: false,
      // 修改对话框的表单对象
      editRuleForm: {
        // 参数名称
        attr_name: ''
      },
      // 修改对话框的表单验证规则对象
      editRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
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
        this.manyTabData = []
        this.onlyTabData = []
        return
      }

      // 证明选中的是三级分类
      console.log(this.selectedCateKeys)

      // 根据所选分类的ID，和当前所处的面板，获取对应的参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }

      // 将 attr_vals 由字符串变为数组元素
      // split() 方法可以将字符串分隔为数组
      res.data.forEach(item => {
        // 进行非空判断
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制按钮与文本框的切换显示
        item.inputVisible = false
        // 文本框中输入的内容
        item.inputValue = ''
      })

      console.log(res.data)
      // 将数据挂载到不同的表格上
      if (this.activeName === 'many') {
        // 将数据挂载到动态参数上
        this.manyTabData = res.data
      } else {
        // 将数据挂载到静态属性上
        this.onlyTabData = res.data
      }
    },
    // 监听对话框的关闭事件
    closeDialogVisible () {
      // 关闭对话框后对表单对象进行重置
      this.$refs.addRuleFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      // 进行提交表单前的预校验
      this.$refs.addRuleFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addRuleForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('添加参数属性失败！')
        }

        this.$message.success('添加参数属性成功！')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },
    // 点击按钮，展示修改的对话框
    async showEditDialog (attrId) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        attr_sel: this.activeName
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      this.editRuleForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框的关闭事件
    editDialogClosed () {
      this.$refs.editRuleFormRef.resetFields()
    },
    // 点击按钮，修改参数
    editParams () {
      // 提交修改参数前，进行表单的预校验
      this.$refs.editRuleFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editRuleForm.attr_id}`, {
          attr_sel: this.activeName,
          attr_name: this.editRuleForm.attr_name
        })

        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }

        this.$message.success('修改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })
    },
    // 点击按钮，进行删除
    async deleteDialog (attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

      // 用户取消了删除的操作
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    // 文本框失去焦点，或者是按下了 enter 键都会触发
    async handleInputConfirm (row) {
      // console.log('ok')
      // trim() 是去除空格的
      // 如果文本框输入的值在去除空格以后，长度还是为 0，那么说明输入的值为空
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return, 则证明输入的内容，需要做后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 需要发起请求，保存这次操作
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
    },
    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // $nextTick 方法的作用是 当页面上的元素被重新渲染以后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项
    async handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      // 需要发起请求，保存这次操作
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }

      this.$message.success('修改参数项成功！')
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
    },
    // 动态计算标题的文本
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>

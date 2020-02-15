<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCatDialog()">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" style="color: lightgreen;" v-if="scope.row.cat_deleted === false"></i>
                    <i class="el-icon-error" style="color: red" v-else></i>
                </template>
                <!-- 排序 -->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[2, 5, 10, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

            <!-- 添加分类的对话框 -->
            <el-dialog
                title="添加分类"
                :visible.sync="addCatDialogVisible"
                width="50%"
                @close="addCatDialogClosed">
                <!-- 添加分类的表单 -->
                <el-form ref="addCatFormRef" :model="addCatForm" :rules="addCatFormRules" label-width="100px">
                    <el-form-item label="分类名称：" prop="cat_name">
                        <el-input v-model="addCatForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类：">
                        <!-- options是指定数据源 -->
                        <!-- props是 指定配置对象-->
                        <!-- change-on-select 允许选择任意一级的选项 -->
                        <el-cascader
                            expand-trigger="hover"
                            :options="parentCatList"
                            :props="catProps"
                            v-model="selectedKeys"
                            @change="parentCatChanged"
                            clearable
                            change-on-select>
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCatDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCate()">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询商品分类的参数对象
      queryInfo: {
        // 展示三级分类
        type: 3,
        // 当前的页码值
        pagenum: 1,
        // 每页显示的条数
        pagesize: 5
      },
      // 商品分类的数据列表
      cateList: [],
      // 总条目数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模版列
          type: 'template',
          // 表示当前这一列使用模版名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示将当前列定义为模版列
          type: 'template',
          // 表示当前这一列使用模版名称
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类的对话框的显示与隐藏
      addCatDialogVisible: false,
      // 添加分类的表单数据
      addCatForm: {
        // 分类名称
        cat_name: '',
        // 分类的父级id
        cat_pid: 0,
        // 分类的层级，默认添加的是一级分类
        cat_level: 0
      },
      // 添加分类的表单验证规则
      addCatFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        cat_id: [
          { required: true, message: '请输入父级分类', trigger: 'blur' }
        ]
      },
      // 父级分类的数据
      parentCatList: [],
      // 指定的级联选择器的配置对象
      catProps: {
        // 指定选项的值为选项对象的某个属性值，相当于是选中的值
        value: 'cat_id',
        // 指定选项标签为选项对象的某个属性值。相当于是展示的值
        label: 'cat_name',
        // 指定选项的子选项为选项对象的某个属性值，相当于是渲染的层级节点
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedKeys: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList () {
      const {data: res} = await this.$http.get('categories', {params: this.queryInfo})
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }

      // 将响应获得的数据赋值给当前的cateList
      this.cateList = res.data.result
      // 将响应获得的数据赋值给当前的total
      this.total = res.data.total
    },
    // 每页显示条目数发生改变后触发的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 当前页码值发生改变后触发的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类的方法
    addCatDialog() {
      // 先获取父级分类的数据列表
      this.getParentCatList()
      // 展示添加分类的对话框
      this.addCatDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCatList() {
      // 在发送获取父级分类的请求中，将type的值设为2，获取两级分类列表
      const {data: res} = await this.$http.get('categories', {params: {type: 2}})
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCatList = res.data
    //   console.log(this.parentCatList)
    },
    // 级联选择器中的选择项变化时触发这个函数
    parentCatChanged () {
      console.log(this.selectedKeys)
      // 如果 selectedKeys 数组中的length大于0，说明选中父级分类，反之则没有选中父级分类
      // selectedKeys的length的长度为0，只有一级分类。selectedKeys的length的长度为1，只有两级分类。selectedKeys的length的长度为2，有三级分类
      if (this.selectedKeys.length > 0) {
        // 为当前的父级分类id赋值
        this.addCatForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前的分类等级赋值
        this.addCatForm.cat_level = this.selectedKeys.length
        // return
      } else {
        // 为当前的父级分类id赋值
        this.addCatForm.cat_pid = 0
        // 为当前的分类等级赋值
        this.addCatForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate () {
    //   console.log(this.addCatForm)
      this.$refs.addCatFormRef.validate(async valid => {
        if (!valid) return
        // 发送添加分类的请求
        const {data: res} = await this.$http.post('categories', this.addCatForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCatDialogVisible = false
      })
    },
    // 监听添加分类对话框的关闭事件，重置表单数据
    addCatDialogClosed () {
      this.$refs.addCatFormRef.resetFields()
      this.selectedKeys = []
      this.addCatForm.cat_pid = 0
      this.addCatForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader {
    width: 100%;
}
</style>

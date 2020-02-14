<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <!-- 栅格布局 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环，渲染二级权限 -->
                                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 渲染三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <!-- <pre>{{ scope.row }}</pre>                         -->
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope" width="300px">
                        <el-button size="mini" type="primary" icon="el-iocn-edit" @click="editRolesDialog(scope.row.id)">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deletRolesById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限的对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加角色的对话框 -->
        <el-dialog
          title="添加角色"
          :visible.sync="addRolesDialogVisible"
          width="50%"
          @close="addRolesDialogClosed">
          <!-- 表单的主体区域 -->
          <el-form ref="addRolesFormRef" :model="addRolesForm" :rules="addRolesFormRules" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="addRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="addRolesForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addRolesDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRoles">确 定</el-button>
          </span>
        </el-dialog>

        <!-- 编辑角色的对话框 -->
        <el-dialog
          title="编辑角色"
          :visible.sync="editRolesDialogVisible"
          width="50%"
          @close="editRolesFormClosed">
          <!-- 表单的主体区域 -->
          <el-form ref="editRolesFormRef" :model="editRolesForm" :rules="editRolesFormRules" label-width="100px">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="editRolesForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc">
              <el-input v-model="editRolesForm.roleDesc"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="editRolesDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRolesInfo()">确 定</el-button>
          </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表的数据
      rolesList: [],
      // 控制分配权限的对话框的显示与隐藏，默认为隐藏
      setRightDialogVisible: false,
      // 所有的权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        // label 指定节点标签为节点对象的某个属性值，也就是展示的值
        label: 'authName',
        // children 指定子树为节点对象的某个属性值，也就是节点数的值
        children: 'children'
      },
      // 默认选中的节点id值数组
      defKeys: [],
      // 当前即将分配权限的角色ID
      roleId: '',
      // 控制添加角色的对话框的显示与隐藏
      addRolesDialogVisible: false,
      // 添加角色的对话框的表单数据
      addRolesForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色的对话框的表单验证规则
      addRolesFormRules: {
        // 角色名称的验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        // 角色描述的验证规则
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 12, message: '长度在 4 到 12 个字符', trigger: 'blur' }
        ]
      },
      // 控制编辑角色的对话框的显示与隐藏
      editRolesDialogVisible: false,
      //  编辑角色的查询角色信息对象
      editRolesForm: {},
      editRolesFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 4, max: 12, message: '长度在 4 到 12 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取所有的角色列表
    async getRolesList() {
      const {data: res} = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }

      this.$message.success('删除成功！')
      // 会获取整个所有的数据，造成列表关闭
      //   this.getRolesList()
      // 将响应获得的数据赋值给当前角色下的所有权限，不会造成表格关闭
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 将当前点击的角色ID的值赋值保存到rleId
      this.roleId = role.id

      // 获取所有的权限数据
      const {data: res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }

      // 将响应获得的数据赋值保存给当前的权限数据rightsList
      this.rightsList = res.data
      // console.log(this.rightsList)

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有的三级权限的id，并且保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      // 如果当前node节点并不包含children属性，那么就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 对node节点进行forEach遍历，再进行递归遍历
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      // 在对话框关闭以后，将当前的defKeys数组清空，防止累加
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights (roleId) {
      const keys = [
        // getCheckedNodes() 返回目前被选中的节点所组成的数组
        ...this.$refs.treeRef.getCheckedNodes(),
        // getHalfCheckedNodes() 返回目前半选中的节点所组成的数组
        ...this.$refs.treeRef.getHalfCheckedNodes()
      ]

      console.log(keys)
      const idStr = keys.join(',')
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})

      if (res.meta.status !== 200) {
        return this.$message.error('分配角色权限失败！')
      }

      this.$message.success('分配角色权限成功！')
      // 重新获取角色列表
      this.getRolesList()
      // 关闭分配权限的对话框
      this.setRightDialogVisible = false
    },
    // 添加角色的方法
    addRoles () {
      // 进行表单的预校验
      this.$refs.addRolesFormRef.validate(async valid => {
        // valid的值是false，校验失败
        if (!valid) return
        // valid的值是true。校验成功，发起添加角色的请求
        const {data: res} = await this.$http.post('roles', this.addRolesForm)
        // console.log(this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        // 提示新增成功
        this.$message.success('添加角色成功！')
        // 隐藏添加角色的对话框
        this.addRolesDialogVisible = false
        // 重新获取数据列表
        this.getRolesList()
      })
    },
    // 监听添加角色的对话框的关闭事件
    addRolesDialogClosed () {
      // 清空表单的数据
      this.$refs.addRolesFormRef.resetFields()
    },
    // 编辑角色的对话框的方法
    async editRolesDialog(id) {
      const {data: res} = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询获取角色信息失败！')
      }
      this.editRolesForm = res.data
      console.log(this.editRolesForm)
      this.editRolesDialogVisible = true
    },
    // 修改角色信息并提交
    editRolesInfo () {
      // 进行提交前的表单预校验
      this.$refs.editRolesFormRef.validate(async valid => {
        if (!valid) return
        // 校验成功后，发起编辑信息并保存的请求
        const {data: res} = await this.$http.put('roles/' + this.editRolesForm.roleId, {
          roleName: this.editRolesForm.roleName,
          roleDesc: this.editRolesForm.roleDesc
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败！')
        }
        // 关闭对话框
        this.editRolesDialogVisible = false
        // 更新数据列表
        this.getRolesList()
        // 提示修改成功
        this.$message.success('更新角色信息成功！')
      })
    },
    // 监听修改角色的对话框的关闭
    editRolesFormClosed () {
      this.$refs.editRolesFormRef.resetFields()
    },
    // 根据id删除角色信息
    async deletRolesById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // 确认删除，发起删除角色的请求
      const {data: res} = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}

.bdtop {
    border-top: 1px  solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>

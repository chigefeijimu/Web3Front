<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="钱包名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入钱包名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="钱包地址" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入钱包地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="钱包私钥" prop="pkey">
        <el-input
          v-model="queryParams.pkey"
          placeholder="请输入钱包私钥"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="钱包归属人" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入钱包归属人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['wallet:wallet:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['wallet:wallet:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['wallet:wallet:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['wallet:wallet:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="walletList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键id" align="center" prop="id" />
      <el-table-column label="钱包名称" align="center" prop="name" />
      <el-table-column label="钱包地址" align="center" prop="address" />
      <el-table-column label="钱包私钥" align="center" prop="pkey" />
      <el-table-column label="钱包归属人" align="center" prop="userId" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['wallet:wallet:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['wallet:wallet:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改钱包管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="walletRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="钱包名称" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入钱包名称"/>
        </el-form-item>
        <el-form-item v-if="form.isAdd === 1" label="钱包地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入钱包地址" />
        </el-form-item>
        <el-form-item v-if="form.isAdd === 1" label="钱包私钥" prop="pkey">
          <el-input v-model="form.pkey" placeholder="请输入钱包私钥" />
        </el-form-item>
        <el-form-item v-if="form.isAdd === 1" label="钱包归属人" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入钱包归属人" />
        </el-form-item>
        <el-form-item v-if="form.isAdd === 0" label="创建靓号" prop="isPretty" required>
          <el-radio v-model="form.isPretty" :label= '1'>是</el-radio>
          <el-radio v-model="form.isPretty" :label= '2'>否</el-radio>
        </el-form-item>
        <el-form-item v-if="form.isAdd === 0 && form.isPretty === 1" label="靓号前缀" prop="prettyPrefix">
          <el-input v-model="form.prettyPrefix" placeholder="请输入靓号前缀" />
        </el-form-item>
        <el-form-item v-if="form.isAdd === 0 && form.isPretty === 1" label="靓号后缀" prop="prettySuffix">
          <el-input v-model="form.prettySuffix" placeholder="请输入靓号后缀" />
        </el-form-item>
        <el-form-item v-if="form.isAdd === 0" label="选择链" prop="chainsValue" required>
          <el-select v-model="form.chainsValue" placeholder="请选择">
            <el-option
                v-for="item in data.chains"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.isAdd === 0" label="钱包备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入钱包备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Wallet">
import { listWallet, getWallet, delWallet, addWallet, updateWallet } from "@/api/wallet/wallet";

const { proxy } = getCurrentInstance();

const walletList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    address: null,
    pkey: null,
    userId: null
  },
  rules: {
  },
  chains: [
    {
      value: 1,
      label: 'ETH'
    }, {
      value: 2,
      label: 'BSC'
    }, {
      value: 3,
      label: 'SOL'
    }
  ],
});

const { queryParams, form, rules } = toRefs(data);

/** 查询钱包管理列表 */
function getList() {
  loading.value = true;
  listWallet(queryParams.value).then(response => {
    walletList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset(1);
}

// 表单重置
function reset(i) {
    form.value = {
      id: null,
      name: null,
      address: null,
      pkey: null,
      createTime: null,
      userId: null,
      isPretty: 2,
      prettyPrefix: null,
      prettySuffix: null,
      isAdd: i,
      chainsValue: '',
      remark: ''
    };
    proxy.resetForm("walletRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset(0);
  open.value = true;
  title.value = "创建钱包";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset(1);
  const _id = row.id || ids.value
  getWallet(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改钱包管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["walletRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWallet(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWallet(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除钱包管理编号为"' + _ids + '"的数据项？').then(function() {
    return delWallet(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('wallet/wallet/export', {
    ...queryParams.value
  }, `wallet_${new Date().getTime()}.xlsx`)
}

getList();
</script>

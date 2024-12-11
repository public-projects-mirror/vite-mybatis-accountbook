<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusIcon } from 'lucide-vue-next'
import type { FormInstance } from 'element-plus'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface CategoryVO {
  id: string;
  categoryName: string;
  createTime: string;
  updateTime: string;
}

interface AddAccountRequest {
  amount: number;
  category: string;
  type: string;
  remarks: string;
}

const categories = ref<CategoryVO[]>([])
const showCustomCategoryInput = ref(false)

const form = ref<AddAccountRequest>({
  amount: 0,
  category: '',
  type: '支出',
  remarks: ''
})

const formRef = ref<FormInstance>()

onMounted(async () => {
  await fetchCategories()
})

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/category/list')
    if (response.data.status === 200) {
      categories.value = response.data.data
    } else {
      ElMessage.error(response.data.message || 'Failed to fetch categories')
    }
  } catch (error) {
    ElMessage.error('Failed to fetch categories')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/api/account/add', form.value)
        if (response.data.status === 200) {
          ElMessage.success('Record added successfully')
          resetForm()
        } else {
          ElMessage.error(response.data.message || 'Failed to add record')
        }
      } catch (error) {
        ElMessage.error('Failed to add record')
      }
    }
  })
}

const resetForm = () => {
  form.value = {
    amount: 0,
    category: '',
    type: '支出',
    remarks: ''
  }
  showCustomCategoryInput.value = false
}

const handleCategoryChange = (value: string) => {
  if (value === '其他') {
    showCustomCategoryInput.value = true
  } else {
    showCustomCategoryInput.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">输入账单</h2>

    <el-form ref="formRef" :model="form" label-width="80px" class="max-w-md mx-auto">
      <el-form-item label="类别" prop="category" required>
        <el-select v-model="form.category" placeholder="选择类别" class="w-full" @change="handleCategoryChange">
          <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
          />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showCustomCategoryInput" label="自定义类别" prop="newCategory">
        <el-input v-model="form.category" placeholder="输入自定义类别" />
      </el-form-item>
      <el-form-item label="金额" prop="amount" required>
        <el-input-number v-model="form.amount" :min="0" :precision="2" class="w-full" />
      </el-form-item>
      <el-form-item label="类型" prop="type" required>
        <el-select v-model="form.type" class="w-full">
          <el-option label="收入" value="收入" />
          <el-option label="支出" value="支出" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remarks">
        <el-input v-model="form.remarks" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit" class="w-full">
          <PlusIcon class="mr-2 h-5 w-5" />
          添加记录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.el-input-number.w-full .el-input__wrapper {
  width: 100%;
}
</style>


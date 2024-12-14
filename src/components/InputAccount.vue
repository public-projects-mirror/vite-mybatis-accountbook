<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusIcon } from 'lucide-vue-next'
import type { FormInstance } from 'element-plus'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'
import { Category, AddAccountRequest, ApiResponse } from '../types'
import { API } from '../api/constants'

const categories = ref<Category[]>([])
const showCustomCategoryInput = ref(false)

const rules = ref<FormRules>({
  category: [
    { required: true, message: '请选择类别', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
})

const form = ref<AddAccountRequest>({
  amount: 0,
  category: '',
  type: '支出',
  remarks: '',
  date: new Date().toISOString().split('T')[0] // 设置默认日为今天
})

const formRef = ref<FormInstance>()

onMounted(async () => {
  await fetchCategories()
})

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/category/list')
    if (response.data.status === "OK") {
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

  try {
    await formRef.value.validate((valid, fields) => {
      if (valid) {
        submitForm()
      } else {
        ElMessage({
          message: '请填写所有必填项',
          type: 'warning',
          duration: 2000
        })
        console.log('验证失败:', fields)
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      ElMessage({
        message: error.message || '验证失败',
        type: 'error',
        duration: 2000
      })
    } else {
      ElMessage({
        message: '发生未知错误',
        type: 'error',
        duration: 2000
      })
    }
  }
}

const submitForm = async () => {
  try {
    const response = await axios.post<ApiResponse<void>>(
      `${API.BASE_URL}${API.ACCOUNTS.ADD}`, 
      {
        ...form.value,
        type: form.value.type.toUpperCase()
      }
    )
    
    if (response.data.status === "OK") {
      ElMessage.success('添加成功')
      resetForm()
    } else {
      ElMessage.error(response.data.message || '添加失败')
    }
  } catch (error) {
    ElMessage.error('提交失败，请稍后重试')
    console.error('提交错误:', error)
  }
}

const resetForm = () => {
  form.value = {
    amount: 0,
    category: '',
    type: '支出',
    remarks: '',
    date: new Date().toISOString().split('T')[0] // 重置日期为今天
  }
  showCustomCategoryInput.value = false
}

const handleCategoryChange = (value: string) => {
  if (value === '其他') {
    showCustomCategoryInput.value = true
    form.value.category = '' // 清空类别，等待用户输入自定义类别
  } else {
    showCustomCategoryInput.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">输入账单</h2>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="max-w-md mx-auto">
      <el-form-item label="类别" prop="category" required>
        <el-select v-model="form.category" placeholder="选择类别" class="w-full" @change="handleCategoryChange">
          <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.categoryName"
          />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="showCustomCategoryInput" label="自定义类别" prop="category">
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
      <el-form-item label="日期" prop="date" required>
        <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
        />
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


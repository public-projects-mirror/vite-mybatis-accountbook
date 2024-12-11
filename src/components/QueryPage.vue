<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface AccountVO {
  id: string;
  amount: number;
  category: string;
  type: string;
  remarks: string;
  createTime: string;
  updateTime: string;
}

interface CategoryVO {
  id: string;
  categoryName: string;
  createTime: string;
  updateTime: string;
}

const totalIncome = ref(0)
const totalExpense = ref(0)
const monthlyIncome = ref(0)
const monthlyExpense = ref(0)
const categoryIncome = ref(0)
const categoryExpense = ref(0)
const customAmount = ref(0)

const selectedMonth = ref('')
const selectedCategory = ref('')
const customType = ref('expense')
const customMonth = ref('')
const customCategory = ref('')

const categories = ref<CategoryVO[]>([])

onMounted(async () => {
  await fetchCategories()
  await fetchTotalIncome()
  await fetchTotalExpense()
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

const fetchTotalIncome = async () => {
  try {
    const response = await axios.get('/api/account/total-income')
    totalIncome.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch total income')
  }
}

const fetchTotalExpense = async () => {
  try {
    const response = await axios.get('/api/account/total-expense')
    totalExpense.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch total expense')
  }
}

const fetchMonthlyIncome = async () => {
  if (!selectedMonth.value) {
    ElMessage.warning('Please select a month')
    return
  }
  try {
    const response = await axios.get(`/api/account/income-by-month?month=${selectedMonth.value}`)
    monthlyIncome.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch monthly income')
  }
}

const fetchMonthlyExpense = async () => {
  if (!selectedMonth.value) {
    ElMessage.warning('Please select a month')
    return
  }
  try {
    const response = await axios.get(`/api/account/expense-by-month?month=${selectedMonth.value}`)
    monthlyExpense.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch monthly expense')
  }
}

const fetchCategoryIncome = async () => {
  if (!selectedCategory.value) {
    ElMessage.warning('Please select a category')
    return
  }
  try {
    const response = await axios.get(`/api/account/income-by-category?categoryId=${selectedCategory.value}`)
    categoryIncome.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch category income')
  }
}

const fetchCategoryExpense = async () => {
  if (!selectedCategory.value) {
    ElMessage.warning('Please select a category')
    return
  }
  try {
    const response = await axios.get(`/api/account/expense-by-category?categoryId=${selectedCategory.value}`)
    categoryExpense.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch category expense')
  }
}

const fetchCustomAmount = async () => {
  if (!customMonth.value || !customCategory.value) {
    ElMessage.warning('Please select both month and category for custom query')
    return
  }
  try {
    const response = await axios.get('/api/account/custom-input', {
      params: {
        type: customType.value,
        month: customMonth.value,
        categoryId: customCategory.value
      }
    })
    customAmount.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch custom amount')
  }
}
</script>

<template>
  <div class="query-page">
    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">查询统计</h2>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="mb-6">
          <template #header>
            <div class="card-header">
              <span>总收入</span>
            </div>
          </template>
          <div class="text-2xl font-bold text-green-600">¥ {{ totalIncome.toFixed(2) }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="mb-6">
          <template #header>
            <div class="card-header">
              <span>总支出</span>
            </div>
          </template>
          <div class="text-2xl font-bold text-red-600">¥ {{ totalExpense.toFixed(2) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mb-6">
      <template #header>
        <div class="card-header">
          <span>月度统计</span>
        </div>
      </template>
      <el-form @submit.prevent>
        <el-form-item label="选择月份">
          <el-date-picker
              v-model="selectedMonth"
              type="month"
              format="YYYY-MM"
              value-format="YYYY-MM"
              placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchMonthlyIncome">查询月度收入</el-button>
          <el-button type="primary" @click="fetchMonthlyExpense">查询月度支出</el-button>
        </el-form-item>
      </el-form>
      <div v-if="monthlyIncome || monthlyExpense" class="mt-4">
        <p v-if="monthlyIncome"><strong>月度收入：</strong> ¥ {{ monthlyIncome.toFixed(2) }}</p>
        <p v-if="monthlyExpense"><strong>月度支出：</strong> ¥ {{ monthlyExpense.toFixed(2) }}</p>
      </div>
    </el-card>

    <el-card class="mb-6">
      <template #header>
        <div class="card-header">
          <span>类别统计</span>
        </div>
      </template>
      <el-form @submit.prevent>
        <el-form-item label="选择类别">
          <el-select v-model="selectedCategory" placeholder="选择类别">
            <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.categoryName"
                :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchCategoryIncome">查询类别收入</el-button>
          <el-button type="primary" @click="fetchCategoryExpense">查询类别支出</el-button>
        </el-form-item>
      </el-form>
      <div v-if="categoryIncome || categoryExpense" class="mt-4">
        <p v-if="categoryIncome"><strong>类别收入：</strong> ¥ {{ categoryIncome.toFixed(2) }}</p>
        <p v-if="categoryExpense"><strong>类别支出：</strong> ¥ {{ categoryExpense.toFixed(2) }}</p>
      </div>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>自定义查询</span>
        </div>
      </template>
      <el-form @submit.prevent="fetchCustomAmount">
        <el-form-item label="类型">
          <el-select v-model="customType">
            <el-option label="支出" value="expense" />
            <el-option label="收入" value="income" />
          </el-select>
        </el-form-item>
        <el-form-item label="月份">
          <el-date-picker
              v-model="customMonth"
              type="month"
              format="YYYY-MM"
              value-format="YYYY-MM"
              placeholder="选择月份"
          />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="customCategory" placeholder="选择类别">
            <el-option
                v-for="category in categories"
                :key="category.id"
                :label="category.categoryName"
                :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchCustomAmount">查询</el-button>
        </el-form-item>
      </el-form>
      <div v-if="customAmount" class="mt-4">
        <strong>查询结果：</strong> ¥ {{ customAmount.toFixed(2) }}
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.query-page {
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>


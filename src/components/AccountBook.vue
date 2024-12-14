<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TrashIcon } from 'lucide-vue-next'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 引入类型定义
import { Transaction, ApiResponse } from '../types'
import { API } from '../api/constants'

// 响应式状态
const transactions = ref<Transaction[]>([])
const totalIncome = ref<number>(0)
const totalExpense = ref<number>(0)
const loading = ref<boolean>(false)

// 统一错误处理
const handleError = (message: string) => {
  ElMessage.error(message)
}

// 格式化函数
const formatAmount = (amount: number) => {
  return `¥ ${amount.toFixed(2)}`
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  const [year, month, day] = dateString.split('-')
  if (!year || !month || !day) return '无效日期'
  return `${year}.${month}.${day}`
}

// 数据验证
const validateTransaction = (data: any): data is Transaction => {
  return typeof data.id === 'string' &&
         typeof data.amount === 'number' &&
         typeof data.category === 'string' &&
         (data.type === '收入' || data.type === '支出')
}

// API 请求函数
const fetchTransactions = async () => {
  loading.value = true
  try {
    const response = await axios.get<ApiResponse<Transaction[]>>(`${API.BASE_URL}${API.ACCOUNTS.LIST}`)
    if (response.data.status === "OK") {
      transactions.value = response.data.data
        .filter(validateTransaction)
        .map((record: Transaction) => ({
          ...record,
          type: record.type.toLowerCase() === 'income' ? '收入' : '支出'
        }))
    } else {
      handleError('获取交易记录失败')
    }
  } catch (error) {
    handleError('获取交易记录失败')
  } finally {
    loading.value = false
  }
}

const fetchTotalIncome = async () => {
  try {
    const response = await axios.get(`${API.BASE_URL}${API.ACCOUNTS.TOTAL_INCOME}`)
    totalIncome.value = response.data
  } catch (error) {
    handleError('获取总收入失败')
  }
}

const fetchTotalExpense = async () => {
  try {
    const response = await axios.get(`${API.BASE_URL}${API.ACCOUNTS.TOTAL_EXPENSE}`)
    totalExpense.value = response.data
  } catch (error) {
    handleError('获取总支出失败')
  }
}

const deleteTransaction = async (id: string) => {
  try {
    const response = await axios.delete(`${API.BASE_URL}${API.ACCOUNTS.DELETE}`, {
      data: { accountId: id }
    })
    if (response.data.status === 'OK') {
      ElMessage.success('删除成功')
      await refreshData()
    } else {
      handleError('删除失败')
    }
  } catch (error) {
    handleError('删除失败')
  }
}

// 刷新数据
const refreshData = async () => {
  await Promise.all([
    fetchTransactions(),
    fetchTotalIncome(),
    fetchTotalExpense()
  ])
}

// 生命周期钩子
onMounted(() => {
  refreshData()
  const timer = setInterval(refreshData, 60000) // 每分钟自动刷新
  onUnmounted(() => clearInterval(timer))
})

// 表格列配置
const tableColumns = [
  { prop: 'category', label: '类别' },
  { prop: 'amount', label: '金额' },
  { prop: 'type', label: '类型' },
  { prop: 'date', label: '日期' },
  { prop: 'remarks', label: '备注' }
]
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">个人记账本</h1>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-700">总收入</h2>
        <p class="text-2xl font-bold text-green-600">{{ formatAmount(totalIncome) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-700">总支出</h2>
        <p class="text-2xl font-bold text-red-600">{{ formatAmount(totalExpense) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-700">结余</h2>
        <p class="text-2xl font-bold" :class="totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'">
          {{ formatAmount(totalIncome - totalExpense) }}
        </p>
      </div>
    </div>

    <!-- 交易记录表格 -->
    <el-table
      v-loading="loading"
      :data="transactions"
      style="width: 100%"
      class="mb-6 shadow-lg rounded-lg overflow-hidden"
      empty-text="暂无交易记录"
    >
      <el-table-column
        v-for="column in tableColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
      >
        <template #default="{ row }" v-if="column.prop === 'amount'">
          <span :class="row.type === '收入' ? 'text-green-600' : 'text-red-600'">
            {{ formatAmount(row.amount) }}
          </span>
        </template>
        <template #default="{ row }" v-else-if="column.prop === 'type'">
          <el-tag :type="row.type === '收入' ? 'success' : 'danger'">
            {{ row.type }}
          </el-tag>
        </template>
        <template #default="{ row }" v-else-if="column.prop === 'date'">
          {{ formatDate(row.date) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="70">
        <template #default="{ row }">
          <el-button
            type="danger"
            @click="deleteTransaction(row.id)"
            class="flex items-center p-2"
          >
            <TrashIcon class="h-5 w-5" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
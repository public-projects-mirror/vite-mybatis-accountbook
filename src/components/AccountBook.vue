<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TrashIcon } from 'lucide-vue-next'
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
  date: string; // Added date field
}

const records = ref<AccountVO[]>([])
const totalIncome = ref(0)
const totalExpense = ref(0)

onMounted(async () => {
  await fetchRecords()
  await fetchTotalIncome()
  await fetchTotalExpense()
})

const fetchRecords = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/accounts/list')
    console.log(response.data.data[0])
    if (response.data.status === "OK") {
      records.value = response.data.data.map((record: any) => ({
        ...record,
        type: record.type.toLowerCase() // 将 "INCOME" 转换为 "收入"，"EXPENSE" 转换为 "支出"
      }))
    } else {
      ElMessage.error(response.data.message || 'Failed to fetch records')
    }
  } catch (error) {
    ElMessage.error('Failed to fetch records')
  }
}

const fetchTotalIncome = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/accounts/total-income')
    totalIncome.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch total income')
  }
}

const fetchTotalExpense = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/accounts/total-expense')
    totalExpense.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch total expense')
  }
}

const deleteRecord = async (id: string) => {
  try {
    const response = await axios.delete('http://localhost:8080/api/accounts/delete', { data: { accountId: id } })
    if (response.data.status === 200) {
      ElMessage.success('Record deleted successfully')
      await fetchRecords()
      await fetchTotalIncome()
      await fetchTotalExpense()
    } else {
      ElMessage.error(response.data.message || 'Failed to delete record')
    }
  } catch (error) {
    ElMessage.error('Failed to delete record')
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return 'Invalid Date';
  return `${year}.${month}.${day}`;
};
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold mb-8 text-center text-gray-800">个人记账本</h1>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-700">总收入</h2>
        <p class="text-2xl font-bold text-green-600">¥ {{ totalIncome.toFixed(2) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-700">总支出</h2>
        <p class="text-2xl font-bold text-red-600">¥ {{ totalExpense.toFixed(2) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold mb-2 text-gray-700">结余</h2>
        <p class="text-2xl font-bold" :class="totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'">
          ¥ {{ (totalIncome - totalExpense).toFixed(2) }}
        </p>
      </div>
    </div>

    <el-table :data="records" style="width: 100%" class="mb-6 shadow-lg rounded-lg overflow-hidden">
      <el-table-column prop="category" label="类别" />
      <el-table-column prop="amount" label="金额">
        <template #default="{ row }">
          <span :class="row.type === '收入' ? 'text-green-600' : 'text-red-600'">
            ¥ {{ row.amount.toFixed(2) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag :type="row.type === '收入' ? 'success' : 'danger'">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="date" label="日期">
        <template #default="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" />
      <el-table-column label="操作" width="70">
        <template #default="{ row }">
          <el-button type="danger" @click="deleteRecord(row.id)" class="flex items-center p-2">
            <TrashIcon class="h-5 w-5" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-vue-next'
import axios from 'axios'
import { ElMessage } from 'element-plus'

interface CategoryVO {
  id: string;
  categoryName: string;
  createTime: string;
  updateTime: string;
}

const categories = ref<CategoryVO[]>([])
const newCategory = ref('')
const editingCategory = ref<CategoryVO | null>(null)

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

const addCategory = async () => {
  if (newCategory.value) {
    try {
      const response = await axios.post('/api/category/add', { categoryName: newCategory.value })
      if (response.data.status === 200) {
        ElMessage.success('Category added successfully')
        newCategory.value = ''
        await fetchCategories()
      } else {
        ElMessage.error(response.data.message || 'Failed to add category')
      }
    } catch (error) {
      ElMessage.error('Failed to add category')
    }
  }
}

const startEditing = (category: CategoryVO) => {
  editingCategory.value = { ...category }
}

const saveEdit = async () => {
  if (editingCategory.value) {
    try {
      const response = await axios.post('/api/category/update', {
        categoryId: editingCategory.value.id,
        categoryName: editingCategory.value.categoryName
      })
      if (response.data.status === 200) {
        ElMessage.success('Category updated successfully')
        editingCategory.value = null
        await fetchCategories()
      } else {
        ElMessage.error(response.data.message || 'Failed to update category')
      }
    } catch (error) {
      ElMessage.error('Failed to update category')
    }
  }
}

const cancelEdit = () => {
  editingCategory.value = null
}

const removeCategory = async (categoryId: string) => {
  try {
    const response = await axios.delete('/api/category/delete', { data: { categoryId } })
    if (response.data.status === 200) {
      ElMessage.success('Category deleted successfully')
      await fetchCategories()
    } else {
      ElMessage.error(response.data.message || 'Failed to delete category')
    }
  } catch (error) {
    ElMessage.error('Failed to delete category')
  }
}
</script>

<template>
  <div>
    <h2 class="text-3xl font-bold mb-6 text-center text-gray-800">管理类别</h2>

    <div class="max-w-md mx-auto">
      <div class="flex items-center space-x-2 mb-4">
        <el-input v-model="newCategory" placeholder="新类别" class="flex-grow" />
        <el-button @click="addCategory" type="success" class="flex items-center">
          <PlusIcon class="mr-2 h-5 w-5" />
          添加类别
        </el-button>
      </div>

      <el-table :data="categories" style="width: 100%">
        <el-table-column prop="categoryName" label="类别名称">
          <template #default="{ row }">
            <template v-if="editingCategory && editingCategory.id === row.id">
              <el-input v-model="editingCategory.categoryName" />
            </template>
            <template v-else>
              {{ row.categoryName }}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <template v-if="editingCategory && editingCategory.id === row.id">
              <el-button type="primary" @click="saveEdit" class="mr-2">
                Save
              </el-button>
              <el-button @click="cancelEdit">
                Cancel
              </el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="startEditing(row)" class="mr-2">
                <PencilIcon class="h-5 w-5" />
              </el-button>
              <el-button type="danger" @click="removeCategory(row.id)">
                <TrashIcon class="h-5 w-5" />
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>


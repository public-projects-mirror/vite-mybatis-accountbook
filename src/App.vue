<template>
  <div class="container mx-auto p-4">
    <button @click="addNewRow" class="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      新增
    </button>
    <table class="min-w-full bg-white border border-gray-300">
      <thead>
      <tr>
        <th v-for="header in headers" :key="header" class="py-2 px-4 border-b">{{ header }}</th>
        <th class="py-2 px-4 border-b">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, index) in rows" :key="index" :class="{'bg-gray-100': row.isEditing}">
        <td v-for="header in headers" :key="header" class="py-2 px-4 border-b">
          <input
              v-if="row.isEditing || row.isNew"
              v-model="row[header]"
              class="w-full p-1 border rounded"
          />
          <span v-else>{{ row[header] }}</span>
        </td>
        <td class="py-2 px-4 border-b">
          <div v-if="row.isEditing || row.isNew" class="flex space-x-2">
            <button @click="confirmEdit(index)" class="text-green-600 hover:text-green-800">
              确定
            </button>
            <button v-if="!row.isNew" @click="deleteRow(index)" class="text-red-600 hover:text-red-800">
              删除
            </button>
          </div>
          <button v-else @click="editRow(index)" class="text-blue-600 hover:text-blue-800">
            编辑
          </button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const headers = ['姓名', '年龄', '职业'];

const rows = ref([
  { '姓名': '张三', '年龄': '25', '职业': '工程师', isEditing: false },
  { '姓名': '李四', '年龄': '30', '职业': '设计师', isEditing: false },
]);

const addNewRow = () => {
  rows.value.push({ '姓名': '', '年龄': '', '职业': '', isEditing: true, isNew: true });
};

const editRow = (index) => {
  rows.value[index].isEditing = true;
};

const confirmEdit = (index) => {
  rows.value[index].isEditing = false;
  rows.value[index].isNew = false;
};

const deleteRow = (index) => {
  rows.value.splice(index, 1);
};
</script>
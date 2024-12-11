<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'
import QueryPage from './components/QueryPage.vue'
import InputAccount from "./components/InputAccount.vue";
import ManageCategory from "./components/ManageCategory.vue";
import AccountBook from "./components/AccountBook.vue";

const activeComponent = ref('AccountingBook')

const components = {
  AccountBook,
  InputAccount,
  ManageCategory,
  QueryPage
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <el-menu
        :default-active="activeComponent"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        @select="activeComponent = $event"
    >
      <el-menu-item index="AccountBook">记账本</el-menu-item>
      <el-menu-item index="InputAccount">输入账单</el-menu-item>
      <el-menu-item index="ManageCategory">管理类别</el-menu-item>
      <el-menu-item index="QueryPage">查询统计</el-menu-item>
    </el-menu>

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
      <component :is="components[activeComponent]" />
    </div>
  </div>
</template>

<style>
.el-menu-demo {
  @apply mb-4;
}
</style>

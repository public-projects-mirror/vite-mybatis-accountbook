import { createRouter, createWebHistory } from 'vue-router'
import AccountBook from './components/AccountBook.vue'
import QueryPage from './components/QueryPage.vue'
import InputAccount from "./components/InputAccount.vue";
import ManageCategory from "./components/ManageCategory.vue";

const routes = [
    { path: '/', component: AccountBook },
    { path: '/input', component: InputAccount},
    { path: '/categories', component: ManageCategory },
    { path: '/query', component: QueryPage },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router


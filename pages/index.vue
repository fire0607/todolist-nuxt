<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";
import { useUserStore } from "~/stores/user";

const todoStore = useTodoStore();
const userStore = useUserStore();

// 頁面載入時檢查登入狀態並獲取待辦事項
onMounted(async () => {
  if (!userStore.isLoggedIn) {
    console.log(userStore.isLoggedIn);
    navigateTo("/login");
    return;
  }

  await todoStore.fetchTodos();
});
</script>

<template>
  <div>TODO主頁</div>
  <p>若未登入，轉跳至登入頁面</p>
  <NuxtLink to="/logIn" class="text-red-500">登入</NuxtLink><br />
  <NuxtLink to="/signUp">註冊</NuxtLink>
  <section>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">待辦事項清單</h1>

      <!-- 載入中狀態 -->
      <div v-if="todoStore.isLoading" class="text-center">
        <p>載入中...</p>
      </div>

      <!-- 錯誤訊息 -->
      <div v-else-if="todoStore.getError" class="text-red-500">
        {{ todoStore.getError }}
      </div>

      <!-- 待辦事項列表 -->
      <div v-else>
        <div v-if="todoStore.getTodos.length === 0" class="text-gray-500">
          目前沒有待辦事項
        </div>

        <ul v-else class="space-y-4">
          <li
            v-for="todo in todoStore.getTodos"
            :key="todo.id"
            class="p-4 border rounded-lg"
          >
            {{ todo.content }}
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped></style>

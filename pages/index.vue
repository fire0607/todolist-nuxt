<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";
import { useUserStore } from "~/stores/user";

const todoStore = useTodoStore();
const userStore = useUserStore();

const value = ref("");

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
  <section class="bg-blue-300 w-full h-screen relative mx-auto sm:grid">
    <div class="hidden absolute z-0 sm:flex">*精美的圖片*</div>
    <section
      class="items-center justify-self-end bg-white w-full h-screen flex flex-col text-center sm:w-3/5"
    >
      <div class="這是方便檢測用的 hidden">
        <NuxtLink to="/logIn" class="text-red-500">登入</NuxtLink><br />
        <NuxtLink to="/signUp">註冊</NuxtLink>
      </div>

      <section class="w-full px-8 sm:w-4/5 sm:px-0">
        <div class="container mx-auto py-20 v-auto-animate">
          <h1 class="text-2xl font-bold mb-4 text-left text-blue-950">
            今日待辦事項
          </h1>
          <div class="relative mb-4">
            <input
              v-model="value"
              class="w-full border-2 border-blue-300 p-1 rounded-md focus:outline-2 focus:outline-blue-500 focus:ring-blue-500 focus:shadow"
            />
            <button class="absolute top-1 right-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28px"
                height="28px"
                viewBox="0 0 16 16"
                class="text-blue-200 font-bold hover:text-blue-400"
              >
                <path
                  fill="currentColor"
                  d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5z"
                ></path>
              </svg>
            </button>
          </div>
          <!-- 載入中狀態 -->
          <div v-if="todoStore.isLoading" class="text-center text-blue-300">
            <p>載入中...</p>
          </div>

          <!-- 錯誤訊息 -->
          <div v-else-if="todoStore.getError" class="text-red-700">
            {{ todoStore.getError }}
          </div>

          <!-- 待辦事項列表 -->
          <div v-else>
            <div v-if="todoStore.getTodos.length === 0" class="text-blue-300">
              目前沒有待辦事項，寫一個吧！
            </div>

            <ul v-else class="space-y-5">
              <li
                v-for="todo in todoStore.getTodos"
                :key="todo.id"
                class="flex items-center py-2 text-left border-b border-blue-100 text-blue-950"
              >
                <input type="checkbox" class="w-5 h-5" />
                <p class="pl-2">{{ todo.content }}</p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </section>
  </section>
</template>

<style scoped></style>

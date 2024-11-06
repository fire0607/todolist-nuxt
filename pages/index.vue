<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";
import { useUserStore } from "~/stores/user";

const todoStore = useTodoStore();
const userStore = useUserStore();
const toast = useToast();

const value = ref("");
const pageLoading = ref(true);

async function initializeApp() {
  try {
    if (!userStore.isLoggedIn) {
      toast.add({
        title: "尚未登入",
        icon: "i-heroicons-exclamation-circle",
        description: `請先登入帳號`,
        color: "red",
        timeout: 2000,
      });
      await navigateTo("/login");
      return;
    }

    await todoStore.fetchTodos();
  } catch (error) {
    console.error(error);
    toast.add({
      title: "錯誤",
      icon: "i-heroicons-exclamation-circle",
      description: `請先登入帳號`,
      color: "red",
      timeout: 2000,
    });
  } finally {
    setTimeout(() => {
      pageLoading.value = false;
    }, 500);
  }
}

// 新增待辦事項
const handleAddTodo = async () => {
  if (!value.value.trim()) {
    return;
  }

  const success = await todoStore.addTodo(value.value);

  if (success) {
    toast.add({
      title: "成功",
      icon: "i-heroicons-check-circle",
      description: "新增待辦事項成功",
      color: "green",
      timeout: 1500,
    });
    value.value = "";
  }
};

// 頁面載入時執行初始化
onMounted(() => {
  initializeApp();
});
</script>

<template>
  <!--  Loading -->
  <div
    v-if="pageLoading"
    class="fixed inset-0 bg-blue-100/80 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div class="flex flex-col items-center gap-2 p-4 rounded-lg">
      <div
        class="animate-spin h-10 w-10 mr-3 border-4 border-blue-200 border-t-blue-500 rounded-full"
      ></div>
      <span class="text-blue-700 font-medium">載入中...</span>
    </div>
  </div>
  <!-- 主畫面 -->
  <template v-else>
    <div class="w-screen bg-blue-100"></div>
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
                @keyup.enter="handleAddTodo"
                class="w-full border-2 border-blue-300 p-1 pl-3 rounded-md focus:outline-2 focus:outline-blue-500 focus:ring-blue-500 focus:shadow"
              />
              <button @click="handleAddTodo" class="absolute top-1 right-2">
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

            <!-- 待辦事項容器 -->
            <div class="relative">
              <!-- 錯誤訊息 -->
              <div v-if="todoStore.getError" class="text-red-700">
                {{ todoStore.getError }}
              </div>

              <!-- 待辦事項列表 -->
              <div v-else>
                <div
                  v-if="todoStore.getTodos.length === 0"
                  class="text-blue-300"
                >
                  目前沒有待辦事項，寫一個吧！
                </div>

                <ul v-else class="space-y-5 px-2">
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

              <!-- 局部載入遮罩 -->
              <div
                v-if="todoStore.isLoading"
                class="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10"
              >
                <div class="flex flex-col items-center gap-2">
                  <div
                    class="animate-spin h-8 w-8 border-4 border-blue-200 border-t-blue-500 rounded-full"
                  ></div>
                  <span class="text-blue-700 text-sm">載入中...</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </section>
  </template>
</template>
<style scoped></style>

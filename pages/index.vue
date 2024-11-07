<script setup lang="ts">
import { useTodoStore } from "~/stores/todo";
import { useUserStore } from "~/stores/user";
import Swal from "sweetalert2";

interface EditingTodo {
  id: string;
  content: string;
}

const todoStore = useTodoStore();
const userStore = useUserStore();
const toast = useToast();

const value = ref("");
const pageLoading = ref(true);

const editingTodo = ref<EditingTodo | null>(null);

// 確認登入狀態
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
      title: "新增成功",
      icon: "i-heroicons-check-circle",
      description: "又多一件事情要做了 (‾◡◝　)",
      color: "green",
      timeout: 1500,
    });
    value.value = "";
  }
};

// 更新待辦事項
const handleEditClick = async (todo: { id: string; content: string }) => {
  editingTodo.value = {
    id: todo.id,
    content: todo.content,
  };

  const { value: newContent } = await Swal.fire({
    title: "修改待辦事項",
    input: "textarea",
    inputValue: editingTodo.value.content,
    confirmButtonColor: "#60a5fa",
    cancelButtonColor: "#d1d5db",
    confirmButtonText: "確認修改",
    cancelButtonText: "取消",
    showCancelButton: true,
    reverseButtons: true,
    inputValidator: (value) => {
      if (!value.trim()) {
        return "請輸入修改內容";
      }
    },
  });

  if (newContent) {
    const success = await todoStore.updateTodo(
      editingTodo.value.id,
      newContent
    );
    if (success) {
      toast.add({
        title: "修改成功",
        icon: "i-heroicons-check-circle",
        description: "待辦事項已修改 d(`･∀･)b",
        color: "green",
        timeout: 1500,
      });
      editingTodo.value = null;
    }
  }
};

// 刪除待辦事項
const handleDeleteTodo = async (todo: { id: string }) => {
  try {
    // 確認框
    const result = await Swal.fire({
      title: "確定要刪除嗎？",
      text: "此操作無法復原",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f87171",
      cancelButtonColor: "#d1d5db",
      confirmButtonText: "確認刪除",
      cancelButtonText: "取消",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      const success = await todoStore.deleteTodo(todo.id);
      if (success) {
        toast.add({
          title: "刪除成功",
          icon: "i-heroicons-check-circle",
          description: "待辦事項已刪除 (๑•̀ㅂ•́)و✧",
          color: "green",
          timeout: 1500,
        });
      } else {
        toast.add({
          title: "刪除失敗",
          icon: "i-heroicons-x-circle",
          description: "刪除待辦事項失敗，請稍後再試",
          color: "red",
          timeout: 2000,
        });
      }
    }
  } catch (error) {
    console.error("刪除待辦事項時出錯:", error);
    toast.add({
      title: "錯誤",
      icon: "i-heroicons-exclamation-circle",
      description: "刪除待辦事項時發生錯誤，請稍後再試",
      color: "red",
      timeout: 2000,
    });
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
    <section class="bg-blue-300 w-screen h-screen relative mx-auto sm:grid">
      <div class="hidden absolute z-0 sm:flex">*精美的圖片*</div>
      <section
        class="items-center justify-self-end bg-white w-full h-screen flex flex-col text-center sm:w-3/5"
      >
        <section class="w-full px-8 sm:w-4/5 sm:px-0">
          <div class="container mx-auto py-20 v-auto-animate">
            <h1 class="text-2xl font-bold mb-4 text-left text-blue-950">
              今日待辦事項
            </h1>
            <!-- 輸入框 -->
            <div class="relative mb-4">
              <textarea
                v-model="value"
                maxlength="100"
                @keyup.enter="handleAddTodo"
                class="w-full min-h-10 max-h-32 border-2 border-blue-300 p-1 pl-3 pr-6 rounded-md text-lg focus:outline-2 focus:outline-blue-400 focus:ring-blue-400 focus:shadow"
              ></textarea>
              <button @click="handleAddTodo" class="absolute top-1 right-1">
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
            <div class="relative h-[450px] overflow-y-auto">
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

                <ul v-else>
                  <li
                    v-for="todo in todoStore.getTodos"
                    :key="todo.id"
                    class="flex items-center justify-start px-2 py-4 text-left border-b border-blue-100 text-blue-950 hover:bg-blue-50"
                  >
                    <input type="checkbox" class="w-5 h-5" />
                    <p class="pl-2">{{ todo.content }}</p>
                    <div class="ml-auto space-x-2">
                      <button
                        @click="handleEditClick(todo)"
                        class="text-blue-100 hover:text-blue-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24px"
                          height="24px"
                          viewBox="0 0 16 16"
                        >
                          <g fill="currentColor">
                            <path
                              d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.8 2.8 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.8 2.8 0 0 0 .892-.596l4.262-4.262a1.75 1.75 0 0 0 0-2.474"
                            ></path>
                            <path
                              d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5z"
                            ></path>
                          </g>
                        </svg>
                      </button>
                      <button
                        @click="handleDeleteTodo(todo)"
                        class="text-blue-100 hover:text-red-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24px"
                          height="24px"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill="currentColor"
                            fillRule="evenodd"
                            d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.286a1.5 1.5 0 0 0 1.492-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25m2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75zM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6m3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </button>
                    </div>
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

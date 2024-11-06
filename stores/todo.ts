import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./user";

interface Todo {
  id: string;
  content: string;
  completed: boolean;
}

export const useTodoStore = defineStore("todo", () => {
  // state
  const todos = ref<Todo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = 10;

  // getters
  const getTodos = computed(() => todos.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getCurrentPage = computed(() => currentPage.value);

  // 計算總頁數
  const totalPages = computed(() => {
    return Math.ceil(todos.value.length / itemsPerPage);
  });

  // 當前頁面的待辦事項
  const paginatedTodos = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return todos.value.slice(start, end);
  });

  // 計算是否需要顯示分頁
  const shouldShowPagination = computed(
    () => todos.value.length > itemsPerPage
  );

  // 設置當前頁面
  const setCurrentPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  // actions
  const fetchTodos = async () => {
    loading.value = true;
    error.value = null;

    try {
      const userStore = useUserStore();
      const token = userStore.getToken;

      if (!token) {
        throw new Error("未登入，請先登入");
      }

      const response = await $fetch<{ todos: Todo[] }>(
        "https://todoo.5xcamp.us/todos",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      todos.value = response.todos;

    } catch (error: any) {
      console.error("獲取待辦事項失敗:", error);
      if (error.status === 401) {
        const userStore = useUserStore();
        userStore.logout();
        navigateTo("/login");
        error.value = "登入已過期，請重新登入";
      } else {
        error.value = "獲取待辦事項失敗，請稍後再試";
      }
    } finally {
      loading.value = false;
    }
  };

  // 新增待辦事項
  const addTodo = async (content: string) => {
    if (!content.trim()) {
      error.value = "待辦事項不能為空";
      return false;
    }

    loading.value = true;
    error.value = null;

    try {
      const userStore = useUserStore();
      const response = await $fetch<{ id: string; content: string }>(
        "https://todoo.5xcamp.us/todos",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userStore.getToken}`,
            "Content-Type": "application/json",
          },
          body: {
            todo: {
              content: content.trim(),
            },
          },
        }
      );

      // 新增到本地狀態
      todos.value.push({
        id: response.id,
        content: response.content,
        completed: false,
      });

      // 檢查是否需要跳轉到最後一頁
      const newTotalPages = Math.ceil(todos.value.length / itemsPerPage);
      currentPage.value = newTotalPages;

      return true;
    } catch (error: any) {
      console.error("新增待辦事項失敗:", error);
      error.value = "新增待辦事項失敗，請稍後再試";
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    // state
    todos,
    loading,
    error,
    currentPage,
    // getters
    getTodos,
    isLoading,
    getError,
    getCurrentPage,
    paginatedTodos,
    totalPages,
    shouldShowPagination,
    // actions
    fetchTodos,
    addTodo,
    setCurrentPage,
  };
});

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "./user";

interface Todo {
  id: number;
  content: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const useTodoStore = defineStore("todo", () => {
  // state
  const todos = ref<Todo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // getters
  const getTodos = computed(() => todos.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);

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

  return {
    // state
    todos,
    loading,
    error,
    // getters
    getTodos,
    isLoading,
    getError,
    // actions
    fetchTodos,
  };
});

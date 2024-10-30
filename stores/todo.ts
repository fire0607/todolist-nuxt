import { defineStore } from "pinia";
import { useUserStore } from "./user";

interface Todo {
  // 根據實際API回傳的資料結構調整這個介面
  id: number;
  content: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export const useTodoStore = defineStore("todo", {
  state: (): TodoState => ({
    todos: [],
    loading: false,
    error: null,
  }),

  getters: {
    getTodos: (state) => state.todos,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
  },

  actions: {
    async fetchTodos() {
      this.loading = true;
      this.error = null;

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

        this.todos = response.todos;
      } catch (error: any) {
        console.error("獲取待辦事項失敗:", error);
        if (error.status === 401) {
          const userStore = useUserStore();
          userStore.logout();
          navigateTo("/login");
          this.error = "登入已過期，請重新登入";
        } else {
          this.error = "獲取待辦事項失敗，請稍後再試";
        }
      } finally {
        this.loading = false;
      }
    },
  },
});

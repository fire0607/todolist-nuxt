import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  SignUpResponse,
  SignUpPayload,
  LogInPayload,
  UserState,
  LoginResponse,
} from "@/types/api";

interface ErrorResponse {
  error?: string;
}

export const useUserStore = defineStore("user", () => {
  // state
  const user = ref<UserState["user"]>(null);
  const token = ref<string | null>(null);

  // getters
  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const getToken = computed(() => token.value);
  const getUserEmail = computed(() => user.value?.email);
  const getUserNickname = computed(() => user.value?.nickname);

  // actions
  const setToken = (headers: Headers) => {
    const authHeader = headers.get("authorization");
    if (authHeader) {
      token.value = authHeader.replace("Bearer ", "");
      // 保存到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("token", token.value);
      }
    }
  };

  const signUp = async (payload: SignUpPayload) => {
    try {
      const response = await $fetch<SignUpResponse>(
        "https://todoo.5xcamp.us/users",
        {
          method: "POST",
          body: {
            user: payload,
          },
        }
      );

      user.value = {
        email: response.email,
        nickname: response.nickname,
      };

      // 儲存用戶資訊
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(user.value));
      }
      return response;
    } catch (error: any) {
      console.error("註冊錯誤:", error);
      if (error.status === 422 && Array.isArray(error.data?.error)) {
        const errorMessages = error.data.error.map((err: string | string[]) => {
          if (err.includes("password.blank")) {
            return "密碼不能為空";
          }
          if (err.includes("email.blank")) {
            return "電子郵件不能為空";
          }
          if (err.includes("email.taken")) {
            return "此電子郵件已被使用";
          }
          return err;
        });
        throw new Error(errorMessages.join("\n"));
      }
      throw new Error(error.data?.message || "註冊失敗，請稍後再試");
    }
  };

  const logIn = async (payload: LogInPayload) => {
    try {
      const response = await $fetch.raw<LoginResponse>(
        "https://todoo.5xcamp.us/users/sign_in",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: {
            user: payload,
          },
        }
      );
      const data = response._data;
      console.log("取得回傳 res：", data);

      if (!data || !data.email || !data.nickname) {
        throw new Error("伺服器回應格式錯誤");
      }

      const authToken = response.headers.get("authorization");
      if (authToken) {
        const headers = new Headers({ authorization: authToken });
        setToken(headers);
      }

      user.value = {
        email: data.email,
        nickname: data.nickname,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(user.value));
      }

      return data;
    } catch (error: any) {
      console.error("登入失敗:", error);
      if (error.status === 401) {
        const errorResponse = error.data as ErrorResponse;
        throw new Error(errorResponse.error || "電子信箱或密碼錯誤");
      }
      throw new Error("登入失敗，請稍後再試");
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // 初始化時檢查登入狀態
  const init = () => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken) {
        token.value = savedToken;
      }

      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser);
        } catch (e) {
          console.error("解析使用者資料失敗:", e);
          logout();
        }
      }
    }
  };

  return {
    // state
    user,
    token,
    // getters
    isLoggedIn,
    getToken,
    getUserEmail,
    getUserNickname,
    // actions
    setToken,
    signUp,
    logIn,
    logout,
    init,
  };
});
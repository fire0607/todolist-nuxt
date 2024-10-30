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
      localStorage.setItem("token", token.value);
      // 保存到 useState（用於 SSR）
      useState("token", () => token.value);
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
      localStorage.setItem("user", JSON.stringify(user.value));
      useState("user", () => user.value);
      return response;
    } catch (error: any) {
      console.error("註冊錯誤:", error);
      // 處理 422 驗證錯誤
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
      // 回應資料（JSON 內容）
      const data = response._data;
      console.log("取得回傳 res：", data);

      // 確保回應格式正確
      if (!data || !data.email || !data.nickname) {
        throw new Error("伺服器回應格式錯誤");
      }

      // 取得 headers，從中取出 authorization 欄位
      const authToken = response.headers.get("authorization");
      console.log("取得authToken：", authToken);

      if (authToken) {
        const headers = new Headers({ authorization: authToken });
        setToken(headers);
      }

      // 更新 user 資訊
      user.value = {
        email: data.email,
        nickname: data.nickname,
      };

      // 儲存用戶資訊
      localStorage.setItem("user", JSON.stringify(user.value));
      useState("user", () => user.value);

      console.log("取得 headers：", response.headers);
      console.log("Authorization Token：", authToken);
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const tokenState = useState<string | null>("token");
    const userState = useState<UserState["user"]>("user");
    tokenState.value = null;
    userState.value = null;
  };

  // 初始化時檢查登入狀態
  const init = () => {
    // 優先從 useState 讀取（支援 SSR）
    const nuxtToken = useState<string | null>("token");
    const nuxtUser = useState<UserState["user"]>("user");

    if (nuxtToken.value && nuxtUser.value) {
      token.value = nuxtToken.value;
      user.value = nuxtUser.value;
      return;
    }

    // 從 localStorage 讀取（僅客戶端）
    if (process) {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        token.value = savedToken;
        user.value = JSON.parse(savedUser);
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

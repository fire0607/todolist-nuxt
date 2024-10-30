import { defineStore } from "pinia";
import type {
  SignUpResponse,
  SignUpPayload,
  LogInPayload,
  UserState,
} from "@/types/api";

interface ErrorResponse {
  error?: string;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    user: null,
    token: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    getToken: (state) => state.token,
    getUserEmail: (state) => state.user?.email,
    getUserNickname: (state) => state.user?.nickname,
  },

  actions: {
    setToken(headers: Headers) {
      const authHeader = headers.get("authorization");
      if (authHeader) {
        this.token = authHeader.replace("Bearer ", "");
        // 保存到 localStorage
        localStorage.setItem("token", this.token);
        // 保存到 useState（用於 SSR）
        useState("token", () => this.token);
      }
    },
    async signUp(payload: SignUpPayload) {
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

        this.user = {
          email: response.email,
          nickname: response.nickname,
        };

        // 儲存用戶資訊
        localStorage.setItem("user", JSON.stringify(this.user));
        useState("user", () => this.user);
        return response;
      } catch (error: any) {
        console.error("註冊錯誤:", error);
        // 處理 422 驗證錯誤
        if (error.status === 422 && Array.isArray(error.data?.error)) {
          const errorMessages = error.data.error.map(
            (err: string | string[]) => {
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
            }
          );
          throw new Error(errorMessages.join("\n"));
        }
        throw new Error(error.data?.message || "註冊失敗，請稍後再試");
      }
    },
    async logIn(payload: LogInPayload) {
      try {
        const response = await $fetch<SignUpResponse>(
          "https://todoo.5xcamp.us/users/sign_in",
          {
            method: "POST",
            body: {
              user: payload,
            },
          }
        );
        if (!response || !response.email || !response.nickname) {
          throw new Error("伺服器回應格式錯誤");
        }

        // 從 response headers 獲取並保存 token
        const headers = useRequestHeaders(["authorization"]);
        if (headers.authorization) {
          this.setToken(new Headers(headers));
        }

        this.user = {
          email: response.email,
          nickname: response.nickname,
        };
        // 儲存用戶資訊
        localStorage.setItem("user", JSON.stringify(this.user));
        useState("user", () => this.user);
        console.log(headers);
        return response;

      } catch (error: any) {
        console.error("登入失敗:", error);
        // 401錯誤
        if (error.status === 401) {
          const errorResponse = error.data as ErrorResponse;
          throw new Error(errorResponse.error || "電子信箱或密碼錯誤");
        }
        // 其他錯誤
        throw new Error("登入失敗，請稍後再試");
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const token = useState<string | null>('token')
      const user = useState<UserState['user']>('user')
      token.value = null
      user.value = null
    },

    // 初始化時檢查登入狀態
    init() {
      // 優先從 useState 讀取（支援 SSR）
      const nuxtToken = useState<string | null>('token')
      const nuxtUser = useState<UserState['user']>('user')
      
      if (nuxtToken.value && nuxtUser.value) {
        this.token = nuxtToken.value;
        this.user = nuxtUser.value;
        return;
      }

      // 從 localStorage 讀取（僅客戶端）
      if (process) {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')
        
        if (savedToken && savedUser) {
          this.token = savedToken
          this.user = JSON.parse(savedUser)
        }
      }
    }
  },
});

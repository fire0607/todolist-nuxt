import { defineStore } from "pinia";
import type { SignUpResponse, SignUpPayload, LogInPayload } from "@/types/api";

interface ErrorResponse {
  error?: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as {
      email: string;
      nickname: string;
    } | null,
  }),

  actions: {
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

        this.user = {
          email: response.email,
          nickname: response.nickname,
        };
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
  },
});

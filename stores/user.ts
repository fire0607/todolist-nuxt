import { defineStore } from 'pinia';
import type { SignUpResponse, SignUpPayload } from '@/types/api';

interface ApiError {
  status: number;
  data: {
    message: string;
    error?: Array<string>;
  };
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as {
      email: string;
      nickname: string;
    } | null
  }),

  actions: {
    async signUp(payload: SignUpPayload) {
      try {
        const response = await $fetch<SignUpResponse>('https://todoo.5xcamp.us/users', {
          method: 'POST',
          body: {
            user: payload 
          }
        });
        
        this.user = {
          email: response.email,
          nickname: response.nickname
        };
        
        return response;
      } catch (error: any) {
        console.error('註冊錯誤:', error);
        
        // 處理 422 驗證錯誤
        if (error.status === 422 && Array.isArray(error.data?.error)) {
          const errorMessages = error.data.error.map((err: string | string[]) => {
            if (err.includes('password.blank')) {
              return '密碼不能為空';
            }
            if (err.includes('email.blank')) {
              return '電子郵件不能為空';
            }
            if (err.includes('email.taken')) {
              return '此電子郵件已被使用';
            }
            return err;
          });
          
          throw new Error(errorMessages.join('\n'));
        }
        
        throw new Error(error.data?.message || '註冊失敗，請稍後再試');
      }
    }
  }
});
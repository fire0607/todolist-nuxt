<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useUserStore } from "@/stores/user";

const toast = useToast();
const userStore = useUserStore();
const router = useRouter();

// 表單驗證規則
const schema = object({
  email: string().email("請輸入正確的電子郵件格式").required("請輸入電子郵件"),
  password: string().min(6, "最少要輸入6個字元").required("請輸入密碼"),
  nickname: string().required("請輸入暱稱"),
});
type Schema = InferType<typeof schema>;

// 表單內容
const state = reactive<{
  email: string;
  password: string;
  nickname: string;
}>({
  email: "",
  password: "",
  nickname: "",
});

// 錯誤訊息
const fieldErrors = reactive({
  email: "",
  password: "",
  nickname: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    // 重置錯誤訊息
    Object.keys(fieldErrors).forEach((key) => {
      fieldErrors[key as keyof typeof fieldErrors] = "";
    });

    // 檢查表單驗證
    try {
      await schema.validate(state, { abortEarly: false });
    } catch (err: any) {
      err.inner.forEach((error: any) => {
        if (error.path) {
          fieldErrors[error.path as keyof typeof fieldErrors] = error.message;
        }
      });
      return;
    }

    await userStore.signUp({
      email: state.email,
      password: state.password,
      nickname: state.nickname,
    });
    toast.add({
      title: "註冊成功",
      icon: "i-heroicons-check-circle",
      description: "歡迎加入我們 :D！",
      color: "green",
      timeout: 2000,
    });
    router.push("/");
  } catch (error: any) {
    console.error("註冊錯誤:", error);
    toast.add({
      title: "註冊失敗",
      icon: "i-heroicons-exclamation-circle",
      description: error.message,
      color: "red",
      timeout: 2000,
    });
  }
}
</script>

<template class="">
  <section class="bg-blue-300 w-full h-screen relative mx-auto sm:grid">
    <div class="hidden absolute z-0 sm:flex">*精美的圖片*</div>
    <section
      class="justify-self-end bg-white w-full h-screen flex flex-col sm:w-6/12"
    >
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 p-20 sm:p-32"
        @submit="onSubmit"
      >
        <section class="block text-center sm:hidden">
          預留手機板標題區塊
        </section>
        <UFormGroup
          label="電子郵件"
          name="email"
          :error="fieldErrors.email"
          class="pt-3 sm:pt-24"
        >
          <UInput
            v-model="state.email"
            :class="{ 'border-red-500': fieldErrors.email }"
          />
        </UFormGroup>

        <UFormGroup label="密碼" name="password" :error="fieldErrors.password">
          <UInput
            v-model="state.password"
            type="password"
            :class="{ 'border-red-500': fieldErrors.password }"
          />
        </UFormGroup>

        <UFormGroup label="暱稱" name="nickname" :error="fieldErrors.nickname">
          <UInput
            v-model="state.nickname"
            :class="{ 'border-red-500': fieldErrors.nickname }"
          />
        </UFormGroup>

        <UButton type="submit" block class="bg-blue-500 py-3 hover:bg-blue-400">
          註冊
        </UButton>
        <div class="justify-self-end">
          <span>已有帳戶？</span>
          <ULink
            to="/logIn"
            active-class="text-primary"
            inactive-class="text-gray-500 hover:text-blue-800 "
          >
            登入
          </ULink>
        </div>
      </UForm>
    </section>
  </section>
</template>

<style scoped></style>

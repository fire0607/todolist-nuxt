<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";
import { useUserStore } from "@/stores/user";

const toast = useToast();
const userStore = useUserStore();
const router = useRouter();

// 表單驗證規則
const schema = object({
  email: string().email("請輸入正確的email格式").required("請輸入電子郵件"),
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
      timeout: 1500,
    });
    router.push("/");
  } catch (error: any) {
    console.error("註冊錯誤:", error);
    toast.add({
      title: "註冊失敗",
      icon: "i-heroicons-exclamation-circle",
      description: error.message,
      color: "red",
      timeout: 1500,
    });
  }
}
</script>

<template>
  <section>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup label="電子郵件" name="email" :error="fieldErrors.email">
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

      <UButton type="submit" block> 註冊 </UButton>
    </UForm>
  </section>
</template>

<style scoped></style>

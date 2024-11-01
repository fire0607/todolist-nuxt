<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const toast = useToast();
const router = useRouter();

const schema = object({
  email: string().email("請輸入正確的電子郵件格式").required("請輸入電子郵件"),
  password: string().min(6, "最少要輸入6個字元").required("請輸入密碼"),
});

type Schema = InferType<typeof schema>;

// 表單內容
const state = reactive<{
  email: string;
  password: string;
}>({
  email: "",
  password: "",
});

// 錯誤訊息
const fieldErrors = reactive({
  email: "",
  password: "",
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const userStore = useUserStore();

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

    await userStore.logIn({
      email: state.email,
      password: state.password,
    });

    if (!userStore.user) {
      throw new Error("登入成功但用戶資料不完整");
    }

    toast.add({
      title: "登入成功",
      icon: "i-heroicons-check-circle",
      description: `${userStore.user.nickname}，歡迎回來！`,
      color: "green",
      timeout: 2000,
    });

    router.push("/");
  } catch (error: any) {
    console.error("登入失敗:", error);
    toast.add({
      title: "登入失敗",
      icon: "i-heroicons-exclamation-circle",
      description: error.message,
      color: "red",
      timeout: 2000,
    });
  }
}
</script>
<template>
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
        <UFormGroup label="電子郵件" name="email" class="pt-3 sm:pt-24">
          <UInput v-model="state.email" />
        </UFormGroup>

        <UFormGroup label="密碼" name="password">
          <UInput v-model="state.password" type="password" />
        </UFormGroup>

        <UButton type="submit" block class="bg-blue-500 py-3 hover:bg-blue-400">
          登入
        </UButton>
        <div class="justify-self-end">
          <span>沒有帳戶？</span>
          <ULink
            to="/signUp"
            active-class="text-primary"
            inactive-class="text-gray-500 hover:text-blue-800 "
          >
            註冊
          </ULink>
        </div>
      </UForm>
    </section>
  </section>
</template>
<style scoped></style>

<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const schema = object({
  email: string().email("請輸入正確的電子郵件格式").required("請輸入電子郵件"),
  password: string().min(6, "至少輸入6個字元").required("請輸入密碼"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  email: undefined,
  password: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with event.data
  console.log(event.data);
}
</script>
<template>
  <section>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormGroup label="電子郵件" name="email">
        <UInput v-model="state.email" />
      </UFormGroup>

      <UFormGroup label="密碼" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormGroup>

      <UButton type="submit"> 登入 </UButton>
    </UForm>
    <div>
      <span>沒有帳戶？</span>
      <ULink
        to="/signUp"
        active-class="text-primary"
        inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        註冊
      </ULink>
    </div>
  </section>
</template>
<style scoped></style>

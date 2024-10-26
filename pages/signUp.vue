<script setup lang="ts">
import { object, string, type InferType } from "yup";
import type { FormSubmitEvent } from "#ui/types";

const schema = object({
  email: string().email("請輸入正確的email格式").required("請輸入電子郵件"),
  password: string().min(6, "最少要輸入6個字元").required("請輸入密碼"),
  nickname: string().required("請輸入暱稱"),
});

type Schema = InferType<typeof schema>;

const state = reactive({
  email: undefined,
  password: undefined,
  nickname: undefined,
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

      <UFormGroup label="暱稱" name="nickname">
        <UInput v-model="state.nickname" type="string" />
      </UFormGroup>

      <UButton type="submit"> 註冊 </UButton>
    </UForm>
  </section>
</template>
<style scoped></style>

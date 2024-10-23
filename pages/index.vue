<script setup lang="ts"></script>

<template>
  <div>TODO主頁</div>
  <p>若未登入，轉跳至登入頁面</p>
  <NuxtLink to="/logIn">登入</NuxtLink><br />
  <NuxtLink to="/signUp">註冊</NuxtLink>
  <ULink
    to="/signUp"
    active-class="text-primary"
    inactive-class="text-gray-500 dark:text-gray-400 hover:text-blue-300 dark:hover:text-gray-200"
  >
    測試元件
  </ULink>
</template>

<style scoped></style>

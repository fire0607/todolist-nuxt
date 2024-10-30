import type { FetchContext } from "ofetch";

export default defineNuxtPlugin((nuxtApp) => {
  const userStore = useUserStore();

  const apiFetch = $fetch.create({
    baseURL: "https://todoo.5xcamp.us",

    onRequest({ options }: FetchContext<any>) {
      const token = userStore.getToken;
      if (token) {
        // 使用新的 Headers 實例並添加 Authorization
        const headers = new Headers(options.headers || {});
        headers.set("Authorization", `Bearer ${token}`);
        options.headers = headers;
      }
      navigateTo("/");
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        userStore.logout();
        navigateTo("/login");
      }
    },
  });

  nuxtApp.provide("apiFetch", apiFetch);
});

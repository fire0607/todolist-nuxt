<script setup lang="ts">
import sprite from "@/assets/image/sprite.svg";
const props = defineProps({
  svgIcon: {
    type: String,
    default: "", // 預設值
    required: true, // 必要屬性
  },
  svgClassStyle: {
    type: String,
    default: "",
  },
});

// 此組件用法如下：
// 1.請依照現有格式將 svg檔案程式碼 貼入 sprite.svg 中
// 2. <TheSvg svgIcon="svg檔案id" class="(請直接撰寫tailwind的class)" />
</script>
<template>
  <svg :class="`${props.svgClassStyle}`">
    <use :href="`${sprite}#${props.svgIcon}`"></use>
  </svg>
</template>
<style scoped></style>

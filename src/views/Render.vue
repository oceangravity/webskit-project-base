<template>
  <ComponentRender>
    <component :is="name"></component>
  </ComponentRender>
</template>

<script lang="ts" setup>
const route = useRoute();
const name = computed(() => defineAsyncComponent(() => import(/* @vite-ignore */ String(route.query.component))));
</script>

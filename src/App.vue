<template>
  <router-view />
</template>

<script lang="ts" setup>
import {useCounterStore} from "@/stores/counter";
const store = useCounterStore();
</script>

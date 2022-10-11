<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div>
    <header .$WebsKit="{ guid: 1}">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

      <div class="wrapper">
        <nav .$WebsKit="{ guid: 2}">
          <RouterLink to="/home">Home</RouterLink>
          <RouterLink to="/about">About</RouterLink>
        </nav>
      </div>
    </header>

    <RouterView />

    <p .$WebsKit="{ guid: 3}">MI#ERDA TIESA</p>
  </div>
</template>

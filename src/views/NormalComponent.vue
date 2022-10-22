<template>
    <div .$wk="{ guid: 5, isContainer: false, parent: 4 }">
      <div v-for="item in 10" .$wk="{ guid: 6, isContainer: false, parent: 5 }">{{ item }}</div>
    </div>
</template>


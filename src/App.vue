<template>
  <div id="app">
    <main-map/>
  </div>
</template>

<script>
import MainMap from './components/MainMap.vue'

export default {
  name: 'App',
  components: {
    MainMap
  }
}
</script>

<style>
#app {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>

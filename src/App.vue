<template>
  <div id="app">
    <main-map/>
    <side-bar class="side-bar"/>
  </div>
</template>

<script>
import MainMap from './components/MainMap.vue'
import SideBar from './components/SideBar.vue'

export default {
  name: 'App',
  components: {
    MainMap,
    SideBar
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Nanum Sqaure';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  > .side-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
  }
} 

</style>
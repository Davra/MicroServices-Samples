<template>
  <VAppBar color="primary" app dark flat clipped-left>
      <VImg
        max-width="94px"
        class="ml-2"
        contain
        :src="require('../assets/davralogo.svg')"
        alt="Davra logo"
      ></VImg>
  </VAppBar>
</template>

<script>

export default {
  name: 'Navbar',
  emits: ['toggle-sidebar']
}
</script>

<style lang="scss">

</style>

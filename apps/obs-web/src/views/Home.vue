<template>
  <q-page class="flex flex-center">
    <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">
  </q-page>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Home extends Vue {

  private name = this.$store.state.activeVessel.name;

  constructor() {
    super();
  }
  
}
</script>

<!--
<script>
export default {
  data() {
    return {
      name: this.$store.state.activeVessel.name
    }
  }
}
</script>
-->

<style>

.hero-logo {
  width: 40%
}

@media screen and (orientation: portrait) {
  .hero-logo {
    width: 80%
  }
}

</style>

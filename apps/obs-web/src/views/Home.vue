<template>
  <q-page class="flex flex-center">
    <img alt="noaa fisheries logo" src="../assets/noaa-fisheries-rgb-2line-horizontal_1.jpg" style="width: 90%">
  </q-page>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Home extends Vue{

  name = this.$store.state.activeVessel.name

  constructor() {
    super()
  }
  
}
</script>


<style>
</style>

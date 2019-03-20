<template>
  <q-page padding>
    <p>This is an about page</p>
    {{ name }}
  </q-page>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class About extends Vue{

  name = this.$store.state.activeVessel.name

  constructor() {
    super()
  }
  
}
</script>

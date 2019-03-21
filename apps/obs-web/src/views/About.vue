<template>
  <q-page padding>
    <p>This is an about page</p>
  </q-page>
</template>

<!--
<script>
export default {
  name: 'PageAbout'
};
</script>
-->


<script lang="ts">

import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class About extends Vue{

  name = this.$store.state.activeVessel.name

  constructor() {
    super()
  }
  
}
</script>

<template>
  <q-page padding>
    <trips />
  </q-page>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Trips from './Trips.vue';

@Component({
  components: {
    'trips': Trips
  }
})
export default class PageHome extends Vue {}
</script>
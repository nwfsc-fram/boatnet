<template>
  <default-layout>
  </default-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import router from '../router';

@Component
export default class Default extends Vue {
  private router = router;
}
</script>

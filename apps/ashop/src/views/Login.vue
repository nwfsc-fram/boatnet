<template>
  <boatnet-login :router="router" appName="ASHOP">
  </boatnet-login>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import router from '../router';

@Component
export default class Login extends Vue {
  private router = router;
}
</script>
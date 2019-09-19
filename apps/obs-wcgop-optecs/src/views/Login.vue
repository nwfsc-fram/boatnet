<template>
  <boatnet-login :router="router" appName="Boatnet WCGOP OPTECS Login">
    <template v-slot:stat_info>
      <div>
          <b>Last Software Update Date:</b>
          {{lastSoftwareUpdateDate}}
        </div>
        <div>
          <b>Last Login Date:</b>
          {{lastLoginDate}}
        </div>
    </template>
  </boatnet-login>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import router from '../router';

@Component
export default class Login extends Vue {
  private router = router;
  private lastSoftwareUpdateDate = '-';
  private lastLoginDate = '-';
}
</script>
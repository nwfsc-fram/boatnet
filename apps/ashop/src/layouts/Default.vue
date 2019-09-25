<template>
  <default-layout>
    <template v-slot:breadcrumb>
      <ashop-breadcrumbs/>
    </template>
  </default-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import router from '../router';
import AshopBreadcrumb from '../components/AshopBreadcrumb.vue';

@Component({
  components: {
    'ashop-breadcrumbs': AshopBreadcrumb
  }
})
export default class Default extends Vue {
  private router = router;
}
</script>

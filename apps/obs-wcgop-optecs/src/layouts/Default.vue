<template>
  <default-layout>
    <template v-slot:menu_item>
      <q-item
        to="/tally"
        exact
      >
        <q-item-section avatar>
          <q-icon name="dialpad" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Tally</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        to="/dynamicTripDetails"
        exact
      >
        <q-item-section avatar>
          <q-icon name="error" />
        </q-item-section>
        <q-item-section>
          <q-item-label>dynamicTripDetails</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:breadcrumb>
      <optecs-breadcrumbs />
    </template>
  </default-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import router from '../router';
import OptecsBreadcrumbs from '../components/OptecsBreadcrumbs.vue';

@Component({
  components: {
    'optecs-breadcrumbs': OptecsBreadcrumbs
  }
})
export default class Default extends Vue {
  private router = router;
}
</script>

<style>
.q-field__label {
  color: #027be3 !important;
}

.q-field__native {
  font-weight: bold !important;
}
</style>

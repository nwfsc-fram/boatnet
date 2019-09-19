<template>
  <default-layout>
    <template v-slot:menu_item>
      <q-item to="/tally" exact>
        <q-item-section avatar>
          <q-icon name="dialpad" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Tally</q-item-label>
        </q-item-section>
      </q-item>
    </template>
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

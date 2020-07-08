<template>
  <q-card>
        <q-tabs
          v-model="tab"
          dense
          class="bg-grey-3 text-black"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="trips" label="Trips" />
          <q-tab name="operations" label="Hauls" />
          <q-tab name="catches" label="Catch" />
          <q-tab name="biospecimens" label="Biospecimens" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="trips">
            <app-debriefer-trips :isFullSize="true"></app-debriefer-trips>
          </q-tab-panel>

          <q-tab-panel name="operations">
            <app-debriefer-operations :isFullSize="true"></app-debriefer-operations>
          </q-tab-panel>

          <q-tab-panel name="catches">
            <app-debriefer-catches :isFullSize="true"></app-debriefer-catches>
          </q-tab-panel>

          <q-tab-panel name="biospecimens">
            <app-debriefer-biospecimens :isFullSize="true"></app-debriefer-biospecimens>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
</template>


<script lang="ts">
import {
  createComponent,
  reactive,
  computed,
  ref,
  watch
} from '@vue/composition-api';
import Vue from 'vue';
import moment from 'moment';
import { AshopCruise } from '@boatnet/bn-models';
import { newCruiseApiTrip } from '@boatnet/bn-common';
import { pouchService } from '@boatnet/bn-pouch';
import { get, set, findIndex } from 'lodash';

export default createComponent({
  props: {
    tableType: String
  },
  setup(props, context) {
    const tab: any = ref(props.tableType);
    return {
      tab
    };
  }
});
</script>
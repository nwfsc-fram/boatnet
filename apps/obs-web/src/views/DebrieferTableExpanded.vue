<template>
  <app-debriefer-wcgop-data :startingTab="tableType" :showPopout="false" :isFullSize="true" />
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
  setup(props, context) {}
});
</script>
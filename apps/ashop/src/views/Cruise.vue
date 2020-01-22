<template>
  <q-page>hi
  </q-page>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount
} from '@vue/composition-api';
import { BaseOperation } from '@boatnet/bn-models';
import { get, set } from 'lodash';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;

    return {
        store
    };
  }
});
</script>
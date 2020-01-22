<template>
    <q-drawer v-model="show" :side="position" class="q-ma-lg" bordered>
      <q-icon name="close" size="md" @click="hide" />
      <div class="text-h5 row justify-center">{{addType}}</div>
      <div v-for="config of appConfig[addType]" :key="appConfig.sample.indexOf(config)">
        <boatnet-common-input-component :config="config" :model="sample"></boatnet-common-input-component>
      </div>
      <div class="row q-gutter-sm q-pa-md justify-center">
        <q-btn color="primary" label="Add" />
      </div>
    </q-drawer>
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
  props: {
    position: String,
    addType: String,
    show: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const appConfig = store.state.appSettings.appConfig;
    const sample = {};
    let show = ref(true);

    function hide() {
      context.emit('hide');
    }

    return {
      appConfig,
      sample,
      hide
    };
  }
});
</script>
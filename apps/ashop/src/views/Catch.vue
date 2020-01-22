<template>
  <q-page>
    <boatnet-summary currentScreen="Catch" :current="currentCatch" @add="add('sample')">
      <!--<template v-slot:table>
              <boatnet-tree-table/>
      </template>-->

      <template v-slot:addButtons>
        <span style>
          <q-btn color="primary" icon="add" label="Subsample" @click="add('subsample')" />
        </span>
      </template>

      <template v-slot:goToButtons>
        <span style="position: relative; right: 10px">
          <q-btn color="primary" icon="fa fa-fish" label="Biospec" />
        </span>
      </template>
    </boatnet-summary>

    <boatnet-catch-panel side="left" :addType="addType" :show="show" @hide="hide"/>
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
    const appConfig = store.state.appSettings.appConfig;

    const sample = {};
    const currentCatch = {};
    const show = ref(false);
    const addType = ref('');

    const saveOnUpdate = async (fieldName: string) => {
      console.log('save');
      // store.dispatch('tripsState/save', haul);
    };

    function add(type: string) {
      console.log(show.value);
      show.value = true;
      addType.value = type;
    }

    function hide() {
      show.value = false;
    }

    return {
      appConfig,
      currentCatch,
      saveOnUpdate,
      sample,
      show,
      addType,
      add,
      hide
    };
  }
});
</script>
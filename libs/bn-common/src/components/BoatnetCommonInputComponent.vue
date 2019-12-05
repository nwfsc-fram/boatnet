<template>
  <div>
    <boatnet-datetime-prime
      v-if="config.type === 'dateTime' && (config.displayCondition ? showField : true)"
      :config="config"
      :date.sync="valueHolder"
      @save="save"
    ></boatnet-datetime-prime>

    <boatnet-keyboard-select-list
      v-if="config.type === 'input' && (config.displayCondition ? showField : true)"
      :displayName="config.displayName"
      :keyboardType="config.keyboardType"
      :label="config.label"
      :list="config.list"
      :val.sync="valueHolder"
      @save="save"
    ></boatnet-keyboard-select-list>

    <boatnet-button-toggle-comp
      v-if="config.type === 'toggle' && (config.displayCondition ? showField : true)"
      :title="config.title"
      :options="config.options"
      :val.sync="valueHolder"
      @save="save"
    ></boatnet-button-toggle-comp>

    <boatnet-location
      v-if="config.type === 'location'"
      :latModelName="config.lat"
      :longModelName="config.long"
      :obj="model"
      @save="save"
    ></boatnet-location>

    <!-- <boatnet-licenses
      v-if="config.type === 'list'"
      :config="config"
      :model="model"
      @save="save"
    ></boatnet-licenses>-->
  </div>
</template>

<script lang="ts">
import { createComponent, computed, reactive } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    config: Object,
    model: Object
  },
  setup(props, context) {
    // determine whether to show a field or not
    const currentHaul = reactive(
      context.root.$store.state.tripsState.currentHaul
    );
    const key =
      props.config && props.config.displayCondition
        ? props.config.displayCondition.key
        : '';
    const value =
      props.config && props.config.displayCondition
        ? props.config.displayCondition.value
        : '';

    const showField = computed(() =>
      get(currentHaul, key) === value ? true : false
    );

    const valueHolder = computed({
      get: () => {
        return get(props.model, props.config ? props.config.modelName : '');
      },
      set: (val: string) => {
        const modelName = props.config ? props.config.modelName : '';
        const fields = modelName.split('.');
        setValue(props.model, fields, val);
      }
    });

    // https://jasonwatmore.com/post/2018/09/10/vuejs-set-get-delete-reactive-nested-object-properties
    function setValue(obj: any, valProps: any, setVal: any) {
      let prop: string = valProps.shift();
      let index: number = -1;
      const arrStart: number = prop.indexOf('[');

      if (arrStart !== -1) {
        index = parseInt(prop.substring(arrStart + 1, prop.indexOf(']')), 10);
        prop = prop.substring(0, arrStart);
      }
      if (!obj[prop] && index === -1) {
        Vue.set(obj, prop, {});
      } else if (!obj[prop] && index !== -1) {
        Vue.set(obj, prop, []);
      }
      if (!valProps.length) {
        if (setVal && typeof setVal === 'object' && !Array.isArray(setVal)) {
          obj[prop] = { ...obj[prop], ...setVal };
        } else if (index !== -1) {
          obj[prop][index] = setVal;
        } else {
          obj[prop] = setVal;
        }
        return;
      }
      setValue(obj[prop], valProps, setVal);
    }

    const save = () => {
      context.emit('save');
    };

    return {
      showField,
      valueHolder,
      save
    };
  }
});
</script>

<template>
  <div>
    <boatnet-button-toggle-comp
      title="Location Format"
      :options="options"
      :val.sync="format"
      @save="save"
    ></boatnet-button-toggle-comp>
    <boatnet-keyboard-select-list
      displayName="Latitude"
      keyboardType="numeric"
      :mask="latMask"
      :val.sync="lat"
      @save="save"
    ></boatnet-keyboard-select-list>
    <boatnet-keyboard-select-list
      displayName="Longitude"
      keyboardType="numeric"
      :mask="longMask"
      :val.sync="long"
      @save="save"
    ></boatnet-keyboard-select-list>
  </div>
</template>

<script lang="ts">
import { createComponent, computed, ref } from '@vue/composition-api';
import { get, set } from 'lodash';
import Vue from 'vue';

export default createComponent({
  props: {
    latModelName: String,
    longModelName: String,
    obj: Object
  },
  setup(props, context) {
    const format = ref('dd');
    const options = [
      {
        label: 'DD',
        value: 'dd'
      },
      {
        label: 'DMS',
        value: 'dms'
      }
    ];

    const latMask = computed(() =>
      format.value === 'dd' ? '##.####°' : '##°##.##'
    );
    const longMask = computed(() =>
      format.value === 'dd' ? '###.####°' : '###°##.##'
    );

    const latName = props && props.latModelName ? props.latModelName : '';
    const longName = props && props.longModelName ? props.longModelName : '';

    const long = computed({
      get: () => {
        return get(props.obj, longName);
      },
      set: (val: string) => {
        const fields = longName.split('.');
        setProp(props.obj, fields, val);
      }
    });

    const lat = computed({
      get: () => {
        return get(props.obj, latName);
      },
      set: (val: string) => {
        const fields = latName.split('.');
        setProp(props.obj, fields, val);
      }
    });

    function setProp(obj: any, setProps: any, value: any) {
      let prop: string = setProps.shift();
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
      if (!setProps.length) {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          obj[prop] = { ...obj[prop], ...value };
        } else if (index !== -1) {
          obj[prop][index] = value;
        } else {
          obj[prop] = value;
        }
        return;
      }
      setProp(obj[prop], setProps, value);
    }

    const save = () => {
      context.emit('save');
    };

    return {
      format,
      latMask,
      longMask,
      lat,
      long,
      options,
      save
    };
  }
});
</script>

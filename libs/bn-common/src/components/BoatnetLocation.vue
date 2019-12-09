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
      get: () =>  get(props.obj, longName),
      set: (val: string) => setValue(props.obj, longName.split('.'), val)
    });

    const lat = computed({
      get: () => get(props.obj, latName),
      set: (val: string) => setValue(props.obj, latName.split('.'), val)
    });

    function setValue(obj: any, fields: any, setTo: any) {
      let field: string = fields.shift();
      let index: number = -1;
      const arrStart: number = field.indexOf('[');

      if (arrStart !== -1) {
        index = parseInt(field.substring(arrStart + 1, field.indexOf(']')), 10);
        field = field.substring(0, arrStart);
      }
      if (!obj[field] && index === -1) {
        Vue.set(obj, field, {});
      } else if (!obj[field] && index !== -1) {
        Vue.set(obj, field, []);
      }
      if (!fields.length) {
        if (setTo && typeof setTo === 'object' && !Array.isArray(setTo)) {
          obj[field] = { ...obj[field], ...setTo };
        } else if (index !== -1) {
          obj[field][index] = setTo;
        } else {
          obj[field] = setTo;
        }
        return;
      }
      setValue(obj[field], fields, setTo);
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

<template>
  <div>
    <boatnet-button-toggle-comp
      :title="label + ' Location Format'"
      :options="options"
      :val.sync="format"
      @save="save"
    ></boatnet-button-toggle-comp>
    <boatnet-keyboard-select-list
      :displayName="label + ' Latitude'"
      keyboardType="numeric"
      :mask="latMask"
      :val.sync="lat"
      @save="save"
    ></boatnet-keyboard-select-list>
    <boatnet-keyboard-select-list
      :displayName="label + ' Longitude'"
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
import { GPSFormat } from '@boatnet/bn-models';
import Coordinates from 'coordinate-parser';

export default createComponent({
  props: {
    model: String,
    label: String,
    obj: Object
  },
  setup(props, context) {
    const model: any = props && props.model ? props.model : '';
    const latName: string = model.concat('.rawInputLocation.coordinates[0]');
    const longName: string = model.concat('.rawInputLocation.coordinates[1]');
    const ddPoint: string = model.concat('.ddLocation.coordinates');
    const unit: string = model.concat('.unit');

    // initialize location unit to DD
    function initUnit() {
      const temp = get(props.obj, unit);
      if (temp === undefined) {
        setValue(props.obj, unit.split('.'), GPSFormat.DD);
      }
    }
    initUnit();

    const options = [
      {
        label: 'DD',
        value: 'DD'
      },
      {
        label: 'DMS',
        value: 'DMS'
      },
      {
        label: 'DMM',
        value: 'DMM'
      }
    ];

    const latMask = computed(() => {
      switch (format.value) {
        case GPSFormat.DD: {
          return '##.####°';
        }
        case GPSFormat.DMS: {
          return '##°##\'##\'\'';
        }
        case GPSFormat.DMM: {
          return '##°##.##\'';
        }
      }
    });

    const longMask = computed(() => {
      switch (format.value) {
        case GPSFormat.DD: {
          return '###.####°';
        }
        case GPSFormat.DMS: {
          return '###°##\'##\'\'';
        }
        case GPSFormat.DMM: {
          return '###°##.##\'';
        }
      }
    });

    const format = computed({
      get: () => get(props.obj, unit),
      set: (val: string) => setValue(props.obj, unit.split('.'), val)
    });

    function setDD(latitude: string, longitude: string) {
      if (latitude && latitude.replace(/[^0-9]/g, '').length === 6 &&
          longitude && longitude.replace(/[^0-9]/g, '').length === 7) {
        const position = new Coordinates(latitude + ', ' + longitude);
        setValue(props.obj, ddPoint.split('.'), [
          position.latitude,
          position.longitude
        ]);
      } else {
        setValue(props.obj, ddPoint.split('.'), []);
      }
    }

    const long = computed({
      get: () => get(props.obj, longName),
      set: (val: string) => {
        const latitude = get(props.obj, latName);
        setValue(props.obj, longName.split('.'), val);
        setDD(latitude, val);
      }
    });

    const lat = computed({
      get: () => get(props.obj, latName),
      set: (val: string) => {
        const longitude = get(props.obj, longName);
        setValue(props.obj, latName.split('.'), val);
        setDD(val, longitude);
      }
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

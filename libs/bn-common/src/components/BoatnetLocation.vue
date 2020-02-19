<template>
  <div>
    <boatnet-button-toggle-comp
      :title="locationLabel + ' Location Format'"
      :options="options"
      :val.sync="format"
    ></boatnet-button-toggle-comp>
    <boatnet-keyboard-select-list
      :displayName="locationLabel + ' Latitude'"
      keyboardType="numeric"
      :mask="latMask"
      :val.sync="lat"
      @save="save"
    ></boatnet-keyboard-select-list>
    <boatnet-keyboard-select-list
      :displayName="locationLabel + ' Longitude'"
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
    val: Object
  },
  setup(props, context) {
    const store = context.root.$store;

    const locationLabel = props.label ? props.label : '';
    const model: any = props && props.model ? props.model : '';

    const currLat = get(props.val, 'rawInputLocation[0]');
    const currLong = get(props.val, 'rawInputLocation[1]');

    const lat: any = currLat ? ref(currLat) : ref('');
    const long: any = currLong ? ref(currLong) : ref('');

    // This defaults to whatever the user last selected
    function initUnit() {
      let rawInputFormat = get(props.val, 'rawInputFormat');
      if (!rawInputFormat) {
        rawInputFormat = store.getters['appSettings/defaultLocationFormat'];
        context.emit('update:val', { rawInputFormat });
      }
    }
    initUnit();

    const options = [
      {
        label: 'DMS',
        value: 'DMS'
      },
      {
        label: 'DMM',
        value: 'DMM'
      },
      {
        label: 'DD',
        value: 'DD'
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
      get: () => {
        return get(props.val, 'rawInputFormat');
      },
      set: (val: string) => {
        store.dispatch('appSettings/setDefaultLocationFormat', val);
        lat.value = '';
        long.value = '';
        const newVal = {
          rawInputFormat: val
        };
        context.emit('update:val', newVal);
      }
    });

    function setDD(latitude: string, longitude: string) {
      if (latitude && latitude.replace(/[^0-9]/g, '').length === 6 &&
          longitude && longitude.replace(/[^0-9]/g, '').length === 7) {
            const position = new Coordinates(latitude + ', ' + longitude);
            return [position.latitude, -position.longitude];
      } else {
        return [];
      }
    }

    const save = () => {
      const ddLocation = setDD(lat.value, long.value);
      const newVal = {
        rawInputLocation: [lat.value, long.value],
        rawInputFormat: format.value,
        ddLocation
      };
      context.emit('update:val', newVal);
      context.emit('save');
    };

    return {
      locationLabel,
      latMask,
      longMask,
      options,
      lat,
      long,
      format,
      save
    };
  }
});
</script>

<template>
  <div>
    <prime-table :value="WcgopBiospecimens" :columns="columns" type="Specimens" uniqueKey="_id" />
  </div>
</template>


<script lang="ts">
import { createComponent, ref, computed, watch } from '@vue/composition-api';
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DebrieferState } from '../_store/types/types';
import { WcgopOperation, WcgopCatch, WcgopSpecimen } from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date } from 'quasar';
import { convertToObject } from 'typescript';
import { getSelected } from '../helpers/localStorage';

export default createComponent({
  setup(props, context) {
    const state = context.root.$store.state;
    const WcgopBiospecimens: any = ref([]);

    const columns = [
      {
        field: 'species',
        header: 'Species',
        type: 'input',
        key: 'wcgopBioSpecies',
        width: '150'
      },
      {
        field: 'tripId',
        header: 'Trip Id',
        type: 'number',
        key: 'wcgopBioTripId',
        width: '80'
      },
      {
        field: 'operationNum',
        header: 'Haul #',
        type: 'number',
        key: 'wcgopBioHaulNum',
        width: '80'
      },
      {
        field: 'disposition',
        header: 'R/D',
        type: 'input',
        key: 'wcgopBioDisposition',
        width: '60'
      },
      {
        field: 'biosampleMethod',
        header: 'BM',
        type: 'number',
        key: 'wcgopBioBM',
        width: '60'
      },
      {
        field: 'sex',
        header: 'Sex',
        type: 'input',
        key: 'wcgopBioSex',
        width: '60'
      },
      {
        field: 'length',
        header: 'Length',
        type: 'number',
        key: 'wcgopBioLength',
        width: '60'
      },
      {
        field: 'width',
        header: 'Width',
        type: 'number',
        key: 'wcgopBioWidth',
        width: '60'
      },
      {
        field: 'viability',
        header: 'Viability',
        type: 'number',
        key: 'wcgopBioVia',
        width: '100'
      },
      {
        field: 'maturity',
        header: 'Maturity',
        type: 'number',
        key: 'wcgopBioMaturity',
        width: '100'
      },
      {
        field: 'adiposePresent',
        header: 'Adi',
        type: 'number',
        key: 'wcgopBioAdi',
        width: '60'
      },
      {
        field: 'type1',
        header: 'Type',
        type: 'number',
        key: 'wcgopBioType1',
        width: '60'
      },
      {
        field: 'barcode1',
        header: '#',
        type: 'number',
        key: 'wcgopBioBarcode1',
        width: '60'
      },
      {
        field: 'type2',
        header: 'Type',
        type: 'number',
        key: 'wcgopBioType2',
        width: '60'
      },
      {
        field: 'barcode2',
        header: '#',
        type: 'number',
        key: 'wcgopBioBarcode2',
        width: '60'
      },
      {
        field: 'type3',
        header: 'Type',
        type: 'number',
        key: 'wcgopBioType3',
        width: '60'
      },
      {
        field: 'barcode3',
        header: '#',
        type: 'number',
        key: 'wcgopBioBarcode3',
        width: '60'
      }
    ];

    watch(() => state.debriefer.operations, getBiospecimens);

    function getBiospecimens() {}

    return {
      WcgopBiospecimens,
      columns
    };
  }
});
</script>

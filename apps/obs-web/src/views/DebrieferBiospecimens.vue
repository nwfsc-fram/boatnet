<template>
  <div>
    <prime-table
      :value="WcgopBiospecimens"
      :columns="columns"
      type="Specimens"
      uniqueKey="_id"
      @save="save"
    />
  </div>
</template>


<script lang="ts">
import { createComponent, ref, computed, watch } from '@vue/composition-api';
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { DebrieferState } from '../_store/types/types';
import { BaseOperation } from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date } from 'quasar';
import { convertToObject } from 'typescript';
import { getSelected } from '../helpers/localStorage';
import { findIndex } from 'lodash';

export default createComponent({
  setup(props, context) {
    const masterDB: Client<any> = couchService.masterDB;
    const state = context.root.$store.state;
    const debriefer = state.debriefer;
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
        field: 'specimen.biosampleMethod.description',
        header: 'BM',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioBM',
        lookupKey: 'biospecimen-sample-method',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen.sex',
        header: 'Sex',
        type: 'toggle',
        listType: 'template',
        list: ['F', 'M', 'U'],
        key: 'wcgopBioSex',
        isEditable: true,
        width: '60'
      },
      {
        field: 'specimen.length.value',
        header: 'Length',
        type: 'number',
        key: 'wcgopBioLength',
        width: '60',
        isEditable: true
      },
      {
        field: 'specimen.width.value',
        header: 'Width',
        type: 'number',
        key: 'wcgopBioWidth',
        width: '60',
        isEditable: true
      },
      {
        field: 'specimen.viability.description',
        header: 'Viability',
        type: 'toggle',
        lookupKey: 'viability',
        lookupField: 'description',
        isEditable: true,
        listType: 'fetch',
        key: 'wcgopBioVia',
        width: '100'
      },
      {
        field: 'specimen.maturity.description',
        header: 'Maturity',
        type: 'toggle',
        listType: 'fetch',
        isEditable: true,
        lookupKey: 'maturity',
        lookupField: 'description',
        key: 'wcgopBioMaturity',
        width: '100'
      },
      {
        field: 'specimen.adiposePresent',
        header: 'Adi',
        type: 'toggle',
        listTyle: 'template',
        list: ['Y', 'N'],
        isEditable: true,
        key: 'wcgopBioAdi',
        width: '60'
      },
      {
        field: 'specimen.biostructures[0].structureType.description',
        header: 'Type 1',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioType1',
        lookupKey: 'biostructure-type',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen.biostructures[0].label',
        header: '# 1',
        type: 'number',
        key: 'wcgopBioBarcode1',
        width: '80',
        isEditable: true
      },
      {
        field: 'specimen.biostructures[1].structureType.description',
        header: 'Type 2',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioType2',
        lookupKey: 'biostructure-type',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen.biostructures[1].label',
        header: '# 2',
        type: 'number',
        key: 'wcgopBioBarcode2',
        width: '80',
        isEditable: true
      },
      {
        field: 'specimen.biostructures[2].structureType.description',
        header: 'Type 3',
        type: 'toggle',
        listType: 'fetch',
        key: 'wcgopBioType3',
        lookupKey: 'biostructure-type',
        lookupField: 'description',
        isEditable: true,
        width: '200'
      },
      {
        field: 'specimen.biostructures[2].label',
        header: '# 3',
        type: 'number',
        key: 'wcgopBioBarcode3',
        width: '80',
        isEditable: true
      }
    ];

    watch(() => state.debriefer.operations, getBiospecimens);

    async function getBiospecimens() {
      const bioSpecimens = [];
      let operationIds: string[] = [];
      const operationHolder = [];

      for (const trip of debriefer.trips) {
        operationIds = operationIds.concat(trip.operationIDs);
      }

      try {
        const options: ListOptions = {
          keys: operationIds
        };
        const operations = await masterDB.listWithDocs(options);
        for (const operation of operations.rows) {
          const tripId = operation.legacy.tripId;
          const operationNum = operation.operationNum;
          const operationId = operation._id;
          const operationRev = operation._rev;

          for (const catches of operation.catches) {
            let disposition = catches.disposition
              ? catches.disposition.description
              : '';
            disposition = disposition === 'Retained' ? 'R' : 'D';
            if (catches.children) {
              for (const child of catches.children) {
                const species = child.catchContent
                  ? child.catchContent.commonNames[0]
                  : '';
                if (child.specimens) {
                  for (const specimen of child.specimens) {
                    bioSpecimens.push({
                      tripId,
                      operationNum,
                      operationId,
                      operationRev,
                      species,
                      disposition,
                      specimen,
                      _id: specimen._id
                    });
                  }
                }
              }
            }
          }
        }
        WcgopBiospecimens.value = bioSpecimens;
      } catch (err) {
        console.log(err + 'error fetching biospecimens');
      }
    }

    async function save(data: any) {
      const operationData: BaseOperation = await masterDB.get(
        data.operationId,
        data.operationRev
      );
      // drill down to specific specimen that was updated and set value
      for (const [i, operation] of operationData.catches.entries()) {
        if (operation.children) {
          for (const [j, child] of operation.children.entries()) {
            if (child.specimens) {
              for (const [k, specimen] of child.specimens.entries()) {
                if (specimen._id === data._id) {
                  operationData.catches[i].children[j].specimens[k] =
                    data.specimen;
                  console.log('successfully updated ' + data._id);
                }
              }
            }
          }
        }
      }
      masterDB
        .put(data.operationId, operationData, data.operationRev)
        .then((response: any) => {
          // update rev for all records from the same haul #.
          // This ensures future saves will be successful
          for (const [i, bio] of WcgopBiospecimens.value.entries()) {
            if (bio.operationId === data.operationId) {
              WcgopBiospecimens.value[i].operationRev = response.rev;
            }
          }
        });
    }

    return {
      WcgopBiospecimens,
      columns,
      save
    };
  }
});
</script>

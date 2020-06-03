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
        field: 'dissections[0].type',
        header: 'Type 1',
        type: 'number',
        key: 'wcgopBioType1',
        width: '100'
      },
      {
        field: 'dissections[0].barcode',
        header: '# 1',
        type: 'number',
        key: 'wcgopBioBarcode1',
        width: '80'
      },
      {
        field: 'dissections[1].type',
        header: 'Type 2',
        type: 'number',
        key: 'wcgopBioType2',
        width: '100'
      },
      {
        field: 'dissections[1].barcode',
        header: '# 2',
        type: 'number',
        key: 'wcgopBioBarcode2',
        width: '80'
      },
      {
        field: 'dissections[2].type',
        header: 'Type 3',
        type: 'number',
        key: 'wcgopBioType3',
        width: '100'
      },
      {
        field: 'dissections[2].barcode',
        header: '# 3',
        type: 'number',
        key: 'wcgopBioBarcode3',
        width: '80'
      }
    ];

    watch(() => state.debriefer.operations, getBiospecimens);

    async function getBiospecimens() {
      const bioSpecimens = [];
      const masterDB: Client<any> = couchService.masterDB;
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

          for (const catches of operation.catches) {
            let disposition = catches.disposition ? catches.disposition.description : '';
            disposition = disposition === 'Retained' ? 'R' : 'D';
            if (catches.children) {
              for (const child of catches.children) {
                const species = child.catchContent
                  ? child.catchContent.commonNames[0] : '';
                if (child.specimens) {
                  for (const specimen of child.specimens) {
                    const dissections: any[] = [];
                    if(specimen.biostructures) {
                      for(const dissection of specimen.biostructures) {
                        dissections.push({
                          type: dissection.structureType ? dissection.structureType.description : '',
                          barcode: dissection.label
                        });
                      }
                    }
                    bioSpecimens.push({
                      tripId,
                      operationNum,
                      operationId,
                      species,
                      disposition,
                      sex: specimen.sex,
                      length: specimen.length ? specimen.length.value : null,
                      width: specimen.width ? specimen.width.value : null,
                      viability: specimen.viability,
                      maturity: specimen.visualMaturity,
                      adiposePresent: specimen.isAdiposePresent ? 'Y' : 'N',
                      biosampleMethod: specimen.biosampleMethod.description,
                      dissections: dissections,
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

    return {
      WcgopBiospecimens,
      columns
    };
  }
});
</script>

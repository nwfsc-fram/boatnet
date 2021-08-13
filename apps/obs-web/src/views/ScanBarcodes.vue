<template>
    <div class="q-pa-md">
      <debriefer-select-comp
        v-if="type === 'scan'"
        style="width: 30%"
        label="Dissection Type"
        :val.sync="inputDissection"
        lookupView="wcgop-lookups"
        lookupLabel="doc.description"
        lookupValue="doc.description"
        :clearable="true"
        :lookupQueryOptions="{ key: 'biostructure-type' }"
        @select="validate"
      />
      <div v-else>
        <debriefer-select-comp
          style="display: inline-block; width: 30%"
          label="Rack Name"
          :val.sync="rack"
          lookupView="rack"
          lookupLabel="value"
          lookupValue="doc"
          :clearable="true"
          :key="scanKey"
        />
        <q-btn
          v-if="isAuthorized(['debriefer'])"
          round
          flat
          style="display: inline-block"
          color="white"
          text-color="black"
          icon="add"
          @click="addRack('add')"
        >
          <q-tooltip class="bg-accent">Create New Rack</q-tooltip>
        </q-btn>
        <q-btn
          v-if="isAuthorized(['debriefer'])"
          round
          flat
          style="display: inline-block"
          :disabled="isEmpty(rack)"
          color="white"
          text-color="black"
          icon="edit"
          @click="addRack('edit')"
        >
          <q-tooltip class="bg-accent">Edit Rack</q-tooltip>
        </q-btn>
        <q-btn
          v-if="isAuthorized(['debriefer'])"
          round
          flat
          style="display: inline-block"
          :disabled="isEmpty(rack)"
          color="white"
          text-color="black"
          icon="delete"
          @click="() => {showDeleteDialog = true}"
        >
          <q-tooltip class="bg-accent">Delete Rack</q-tooltip>
        </q-btn>
      </div>
      <q-input
        class="q-pt-md"
        style="width: 30%"
        label="Barcode"
        debounce="500"
        v-model="barcode"
        clearable
        clear-icon="close"
        @input="scanBarcode"
        @clear="clear"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-space/>
          <q-banner
            v-if="bannerInfo"
            dense
            :class="bannerInfo.style">
            <template v-slot:avatar>
              <q-icon :name="bannerInfo.icon" color="white" />
            </template>
              <span v-html="bannerInfo.message">
                {{bannerInfo.message}}
              </span>
            <template v-slot:action>
              <q-btn flat label="Dismiss" @click="hideBanner"/>
            </template>
        </q-banner>

      <q-card class="bg-grey-2 q-mt-lg">
        <q-card-section>
          <div class="text-subtitle2" style="color: bg-primary"></div>
          <q-input v-model="specimen.structureType" label="Dissection Type" readonly />
          <q-input v-model="specimen.observerName" label="Observer" readonly />
          <q-input v-model="specimen.tripNum" label="Trip #" readonly/>
          <q-input v-model="specimen.haulNum" label="Haul #" readonly />
          <q-input v-model="specimen.catchNum" label="Catch #" readonly />
          <q-input v-model="specimen.species" label="Species" readonly />
        </q-card-section>
      </q-card>
      <rack-dialog
        :show.sync="showRackDialog"
        :rack="rackDialogInfo"
        @saveRack="saveRack"
      />
      <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="primary" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete rack {{rack.rackName}}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Yes" color="primary" @click="deleteRack" v-close-popup />
          <q-btn flat label="No" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    </div>
</template>


<script lang="ts">
import { createComponent, ref, reactive, watch } from '@vue/composition-api';
import Vue from 'vue';
import DebrieferSelectComp from './DebrieferSelectComp.vue';
import Multiselect from 'vue-multiselect';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { get, isEmpty, parseInt, set } from 'lodash';
import RackDialog from './RackDialog.vue';
import BoatnetInputDialog from 'libs/bn-common/src/components/BoatnetInputDialog.vue';

Vue.component('RackDialog', RackDialog);
Vue.component('multiselect', Multiselect);
Vue.component('DebrieferSelectComp', DebrieferSelectComp);

export default createComponent({
  props: {
    type: String
  },
  setup(props, context) {
    const jp = require('jsonpath');
    const state = context.root.$store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const inputDissection: any = ref('');
    const barcode: any = ref('');
    const specimen: any = ref({});
    const bannerInfo: any = ref(null);

    const rack: any = ref({});
    const rackDialogInfo: any = ref({});
    const showRackDialog: any = ref(false);
    const showDeleteDialog: any = ref(false);

    const scanKey: any = ref(1);

    function isAuthorized(authorizedRoles: string[]) {
        for (const role of authorizedRoles) {
            if (state.user.userRoles.includes(role)) {
                return true;
            }
        }
        return false;
    }

    function saveRack() {
      scanKey.value++;
    }

    function addRack(action: string) {
      if (action === 'add') {
        rackDialogInfo.value = {};
      } else {
        rackDialogInfo.value = rack.value;
      }
      showRackDialog.value = true;
    }

    async function deleteRack() {
      await masterDB.delete(rack.value._id, rack.value._rev);
      scanKey.value++;
    }

    async function validate(val: any) {
      populateSpecimenInfo(barcode.value);
    }

    async function scanBarcode(val: any) {
      if (val) {
        const masterDB: Client<any> = couchService.masterDB;
        const barcodeDoc = await masterDB.viewWithDocs('obs_web', 'biostructures_barcode', { key: parseInt(val, 10) });
        await populateSpecimenInfo(barcodeDoc);
        if (props.type === 'scan') {
          await checkInBio(val, barcodeDoc);
        } else {
          await rackBio(val, barcodeDoc);
        }
      }
    }

    async function populateSpecimenInfo(barcodeInfo: any) {
        specimen.value = get(barcodeInfo, 'rows[0].value', {});
        const structureType = get(specimen.value, 'biostructure.structureType.description', '');
        specimen.value.structureType = structureType;

        // get trip doc to get observer name
        const tripNum = get(specimen.value, 'tripNum');
        const tripDetails = await masterDB.viewWithDocs(
            'obs_web',
            'wcgop_trips_compound_fields',
            {
                start_key: ['tripId', tripNum],
                end_key: ['tripId', tripNum],
            }
        );
        const firstName = get(tripDetails, 'rows[0].doc.observer.firstName', '');
        const lastName = get(tripDetails, 'rows[0].doc.observer.lastName', '');
        specimen.value.observerName = firstName + ' ' + lastName;        
    }

    async function rackBio(barcode: string, barcodeDoc: any) {
      const doc: any = get(barcodeDoc, 'rows[0].doc');
      const biostructure: any = jp.nodes(doc, '$..biostructures[?(@.label=="' + barcode + '")]');
      const rackInfo = get(rack, 'value', {});

      if (!get(rackInfo, 'rackName')) {
        bannerInfo.value = {
          message: 'Select a rack before proceeding',
          icon: 'warning',
          style: 'bg-red q-mt-sm text-white'
        }
      } else if (get(biostructure, '[0].value.legacy.rackId')) {
        const rackId = get(biostructure, '[0].value.legacy.rackId');
        const lookupRackInfo = await masterDB.viewWithDocs('obs_web', 'rack', { key: rackId});
  
        bannerInfo.value = {
          message: 'Biostructure already assigned to rack: <b>' + get(lookupRackInfo, 'rows[0].doc.rackName') + '</b>',
          icon: "info",
          style: 'bg-grey text-white q-mt-sm'
        }
      } else {
        bannerInfo.value = {
          message: 'Successfully added biostructure with barcode: <b>' + barcode + '</b> to rack: <b>' + rackInfo.rackName + '</b>',
          icon: 'done',
          style: 'bg-green q-mt-sm text-white'
        };

        set(biostructure[0].value, 'legacy.rackId', rackInfo.rackId);

        const path: string = jp.stringify(biostructure[0].path).slice(2);
        set(doc, path, biostructure[0].value);
        await masterDB.put(doc._id, doc, doc._rev);
      }
    }

    async function checkInBio(barcode: string, barcodeDoc: any) {
      specimen.value = get(barcodeDoc, 'rows[0].value', {});
      const structureType = get(specimen.value, 'biostructure.structureType.description', '');

      // populating banner messages
      if (!inputDissection.value) {
          bannerInfo.value = {
            message: 'Missing dissection type',
            icon: 'warning',
            style: 'bg-red q-mt-sm text-white'
          }
        } else if (get(specimen.value, 'biostructure.isReceived')) {
          bannerInfo.value = {
            message: "Item already marked as received",
            icon: 'info',
            style: 'bg-grey text-white q-mt-sm'
          };
        } else if (barcodeDoc.rows.length === 0) {
          bannerInfo.value = {
            message: 'Barcode not found',
            icon: 'info',
            style: 'bg-grey text-white q-mt-sm'
          }
        } else if (inputDissection.value != structureType && barcodeDoc.rows.length > 0) {
          bannerInfo.value = {
            message: 'Dissection type mismatch. <b>Expected: </b>' + inputDissection.value + '<b> Received: </b>' + structureType,
            icon: 'warning',
            style: 'bg-red q-mt-sm text-white'
          }
        } else {
          bannerInfo.value = {
            message: "Item received",
            icon: 'done',
            style: 'bg-green q-mt-sm text-white'
          };
          const doc: any = barcodeDoc.rows[0].doc;
          const biostructure: any = jp.nodes(doc, '$..biostructures[?(@.label=="' + barcode + '")]');
          const path: string = jp.stringify(biostructure[0].path).slice(2);

          set(biostructure[0].value, 'isReceived', true);
          set(doc, path, biostructure[0].value);
          await masterDB.put(doc._id, doc, doc._rev);
        }
    }

    function hideBanner() {
      bannerInfo.value = null;
    }

    function clear() {
      specimen.value = {};
      hideBanner();
    }

    return {
        inputDissection,
        barcode,
        isAuthorized,
        bannerInfo,

        clear,
        hideBanner,
        specimen,

        showRackDialog,
        showDeleteDialog,
        rack,
        rackDialogInfo,
        addRack,
        saveRack,
        deleteRack,
        isEmpty,

        scanBarcode,
        validate,

        scanKey
    };
  },
});
</script>
<template>
  <div class="q-pa-md q-gutter-md">

    <div v-if="speciesDoc" class="q-gutter-md">
        <p><b>Doc. Type:</b> {{ speciesDoc.type }}</p>
        <p><b>Name(s):</b> {{ speciesDoc.name ? speciesDoc.name : speciesDoc.commonNames }}</p>
        <p><b>Scientific Name:</b> {{ speciesDoc.taxonomy ? speciesDoc.taxonomy.scientificName : '' }}</p>


        <div class="row">
            <q-select v-model="speciesDoc.speciesCategory" :options="categoryOptions" label="Category" dense outlined class="q-ma-sm cat-input"></q-select>
            <q-select v-model="speciesDoc.speciesSubCategory" :options="subCategoryOptions[speciesDoc.speciesCategory]" label="Sub Category" dense outlined class="q-ma-sm cat-input"></q-select>
        </div>

        <div class="row">
            <q-input v-model="speciesDoc.wcgopSpeciesCode" label="WCGOP Species Code" dense outlined class="q-ma-sm"></q-input>
            <q-input v-model="speciesDoc.pacfinSpeciesCode" label="PACFIN Species Code" dense outlined class="q-ma-sm"></q-input>
        </div>

        <q-toggle v-model="speciesDoc.isActive" label="isActive"></q-toggle>
        <q-toggle v-model="speciesDoc.isEm" label="isEm"></q-toggle>
        <q-toggle v-model="speciesDoc.isEmExpandable" label="isEmExpandable"></q-toggle>
        <q-toggle v-model="speciesDoc.isProtected" label="isProtected"></q-toggle>
        <q-toggle v-model="speciesDoc.isWcgopEmPriority" label="isWcgopEmPriority"></q-toggle>
        <div>(toggle in middle position = no value set)</div>

        <q-btn
            color="primary"
            label="update"
            @click="submit"
        ></q-btn>

        <q-btn
            color="primary"
            label="cancel"
            @click="clear"
        ></q-btn>
    </div>

  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';

import { Vue, Watch } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { WatchOptions } from 'vue';

import { Notify } from 'quasar';
import moment from 'moment';

import _, { cloneDeep } from 'lodash';

import { getTripsApiTrip, getCatchApiCatch, getTripsApiTrips } from '@boatnet/bn-common';
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const docId: any = ref(null);
    const loading: any = ref(false);
    const speciesDoc: any = ref({
        type: null,
        wcgopSpeciesCode: null,
        hasWcgopCode: null,
        pacfinSpeciesCode: null,
        hasPacfinCode: null,
        isProtected: null,
        isWcgopEmPriority: null,
        isEm: null,
        isActive: null,
        speciesCategory: null,
        speciesSubCategory: null,
        isEmExpandable: null,
        name: null
    });
    let previousVersion: any = null;
    const changeLog: any = ref({});

    const categoryOptions: string[] = [
        'Bird', 'Fish', 'Invertebrate', 'Mammal', 'Reptile'
    ];

    const subCategoryOptions: any = {
        Bird: ['Albatross', 'Auklet', 'Bird Other', 'Cormorant', 'Grebe', 'Gull', 'Loon', 'Murre', 'Murrelet', 'Pelican', 'Shearwater', 'Storm-Petrel', 'Tern'],
        Fish: ['Cod', 'Fish Other', 'Flatfish', 'Grenadier', 'Rockfish', 'Salmon/Trout', 'Sculpin', 'Shark', 'Skate/Ray', 'Tuna/Mackerel'],
        Invertebrate: ['Coral', 'Crab', 'Invert Other', 'Octopus', 'Shrimp', 'Squid'],
        Mammal: ['Dolphin/Porpoise', 'Mammal Other', 'Sea Lion', 'Sea Otter', 'Seal', 'Whale'],
        Reptile: ['Sea Turtle']
    };

    const masterDB: Client<any> = couchService.masterDB;


    const formatDate: any = (dateVal: any) => {
      return moment(dateVal).format('MMM DD, YYYY HH:mm');
    };

    const getDoc: any = async () => {
        try {
            const couchDoc = await masterDB.get(docId.value);
            if (!couchDoc.changeLog) {couchDoc.changeLog = []; }
            speciesDoc.value = couchDoc;
            previousVersion = _.cloneDeep(couchDoc);
        } catch (err) {
            Notify.create({
                message: err
            });
        }
    };

    const submit = async () => {
        speciesDoc.value.changeLog.unshift({
            updatedBy: authService.getCurrentUser()!.username,
            updatedDate: moment().format(),
            changes: changeLog.value
        });
        await masterDB.put(
            speciesDoc.value._id,
            speciesDoc.value,
            speciesDoc.value.rev
        );
        Notify.create({
            message: 'changes saved'
        });
        context.root.$router.push({path: '/species-viewer'});
    };

    const clear: any = () => {
        Notify.create({
            message: 'changed discarded'
        });
        context.root.$router.push({path: '/species-viewer'});
    };

    onMounted( () => {
      docId.value = context.root.$route.params.id;
      getDoc();
    });

    const watcherOptions: WatchOptions = {
      immediate: false, deep: true
    };

    watch(
      () => docId.value,
      (newVal, oldVal) => {
          if (oldVal && newVal !== oldVal) {
              speciesDoc.value = null;
              getDoc();
          }
      },
      watcherOptions
    );

    watch(
      () => speciesDoc.value.speciesCategory,
      (newVal, oldVal) => {
          if (oldVal && newVal !== oldVal) {
              speciesDoc.value.speciesSubCategory = null;
          }
      },
      watcherOptions
    );

    watch(
      () => speciesDoc.value,
      (newVal, oldVal) => {
          if (previousVersion) {
            let allkeys: any = _.union(_.keys(previousVersion), _.keys(newVal));
            allkeys = _.omit(allkeys, ['changeLog', 'value']);
            const difference = _.reduce(allkeys, (result: any, key) => {
                if ( !_.isEqual(previousVersion[key], newVal[key]) ) {
                    result[key] = {previousValue: previousVersion[key], newValue: newVal[key]};
                }
                return result;
            }, {});
            changeLog.value = difference;
          }
      },
      watcherOptions
    );

    return {
        docId, speciesDoc, formatDate, submit, loading, clear, categoryOptions, subCategoryOptions
    };
  }
});
</script>

<style scoped>

* >>> .q-field__messages {
  color: red !important
}

.cat-input {
    width: 185px
}
</style>

<template>
  <div class="q-pa-md q-gutter-md">

    <div v-if="speciesDoc" class="q-gutter-md">
        <q-card >
            <q-card-section>
                <span><b>Name(s):</b> {{ speciesDoc.name ? speciesDoc.name : speciesDoc.commonNames }}</span><br>
                <span><b>Doc. Type:</b> {{ speciesDoc.type }}</span><br>
                <span><b>Scientific Name:</b> {{ speciesDoc.taxonomy ? speciesDoc.taxonomy.scientificName : '' }}</span>
            </q-card-section>
            <q-card-section v-if="speciesDoc.members && speciesDoc.members.length > 0" class="text-white bg-primary">
                <span><b>Common Name Members:</b> {{ getMemberCommonNames(speciesDoc.members) }}</span><br>
               <span><b>Scientific Name Members:</b> {{ getMemberScientificNames(speciesDoc.members) }}</span>
            </q-card-section>
        </q-card>

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
        <q-toggle v-model="speciesDoc.isTargetStrategy" label="isTargetStrategy"></q-toggle>
        <br><span style="margin-left: 35px">(toggle in middle = no value set)</span><br>

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

        <q-table
        v-if="speciesDoc.changeLog && speciesDoc.changeLog.length > 0"
        :data="speciesDoc.changeLog"
        :columns="columns"
        dense
        row-key="id"
        :title="speciesDoc.name ? speciesDoc.name : speciesDoc.commonNames[0] ? speciesDoc.commonNames[0] : speciesDoc.taxonomy.scientificName + ' ' + capitalize(speciesDoc.type) + ' Document Changelog'"
        >
            <template v-slot:body="props">
                <q-tr :props="props">

                    <q-td key="updatedBy" :props="props">{{ capitalize(props.row.updatedBy) }}</q-td>
                    <q-td key="updatedDate" :props="props">{{ formatDate(props.row.updatedDate) }}</q-td>
                    <q-td key="changes" :props="props" >{{ props.row.changes }}</q-td>
                </q-tr>
            </template>
        </q-table>

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

    const columns = [
        {name: 'updatedBy', label: 'Updated By', field: 'updatedBy', required: false, align: 'left', sortable: true},
        {name: 'updatedDate', label: 'Updated Date', field: 'updatedDate', required: false, align: 'left', sortable: true},
        {name: 'changes', label: 'Changes', field: 'changes', required: false, align: 'left', sortable: true}
    ];

    const formatDate: any = (dateVal: any) => {
      return moment(dateVal).format('MMM DD, YYYY HH:mm');
    };

    const capitalize: any = (name: string) => {
        let formattedName = '';
        name.split(/[.-]/).forEach( (nameSeg: string) => {
            formattedName += _.capitalize(nameSeg) + ' ';
        });
        return formattedName;
    };

    const getMemberCommonNames: any = (members: any) => {
        let commonNames = '';
        for (const member of members) {
            if (member.commonNames) {
                member.commonNames.forEach(
                    (name: string) => {
                        commonNames += name;
                        if (member.commonNames.indexOf(name) < member.commonNames.length - 1) {
                            commonNames += ', ';
                        }
                    }
                );
            }
        }
        return commonNames;
    };

    const getMemberScientificNames: any = (members: any) => {
        let scientificNames = '';
        for (const member of members) {

            if (member.taxonomy) {
                scientificNames += member.taxonomy.scientificName;
            }
            if (members.indexOf(member) < members.length - 1) {
                scientificNames += ', ';
            }
        }
        return scientificNames;
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
        docId, speciesDoc, formatDate, capitalize, columns, submit, loading, clear, categoryOptions, subCategoryOptions, getMemberCommonNames, getMemberScientificNames
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

.bordered-section {
    margin: 15px;
    padding: 5px;
    border: 2px solid #007EC6;
    border-radius: 5px;
}

td {
    padding: 5px;
}

thead {
    background-color: #007EC6;
    color: white;
}

</style>

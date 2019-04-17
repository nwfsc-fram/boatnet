<template>
    <div>

        <q-table
            :data="EM_EFP"
            :columns="columns"
            dense
            row-key="vessel_name"
            selection="single"
            :selected.sync="selected"
            >
            
        <!-- <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="vessel_name" :props="props">{{ props.row.vessel_name }}</q-td>
          <q-td key="USCG" :props="props">{{ props.row.USCG }}</q-td>
          <q-td key="LEP" :props="props">{{ props.row.LEP }}</q-td>
          <q-td key="EFP_Type" :props="props">{{ props.row.EFP_Type }}</q-td>
          <q-td key="Gear" :props="props">{{ props.row.Gear }}</q-td>
          <q-td key="Sector" :props="props">{{ props.row.Sector }}</q-td>
          <q-td key="EM_EFP_Number" :props="props">{{ props.row.EM_EFP_Number }}</q-td>
          <q-td key="Notes" :props="props">{{ props.row.Notes }}</q-td>
        </q-tr>
        </template> -->
        </q-table>

        <div v-if="selected.length > 0">{{ selected }}</div>
    </div>
</template>

<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator

import router from '../router';
import { AlertState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { EmEfpPermit } from '@boatnet/bn-models';

@Component
export default class EMEFPManagement extends Vue {
 
private selected = []

private EM_EFP: EmEfpPermit[] = [
    {type: 'EmEfpPermit', vesselName: 'Alex', vesselCGNumber: '580568', lePermit: 'GF0084', 
    efpTypes: [{'description':'Leipzig'}], gear: ['Bottom trawl, midwater'], emEfpNumber: 'EM-34'},
    {type: 'EmEfpPermit', vesselName: 'Alyssa Ann', vesselCGNumber: '976374', lePermit: 'GF0875',
    efpTypes: [{'description':'Eder'}], gear: ['Pot'], emEfpNumber: 'EM-04'},
    {type: 'EmEfpPermit', vesselName: 'Arctic Fury', vesselCGNumber: '996920', lePermit: 'GF0675', efpTypes: [{'description':'Whiting'}], gear: ['Midwater trawl'], 
    sector: 'Both', emEfpNumber: 'EM-38', notes: 'Here is a long note that you would expect would change column widths and make text wrap to the next line'},    
  ] 

private columns = [
    {name: 'vessel_name', label: 'Vessel Name', field: 'vessel_name', required: true, align: 'left', sortable: true },
    {name: 'USCG', label: 'Coast Guard Number', field: 'USCG', required: true, align: 'left', sortable: true },
    {name: 'LEP', label: 'LE Permit', field: 'LEP', required: true, align: 'left', sortable: true },
    {name: 'EFP_Type', label: 'EFP Type', field: 'EFP_TYPE', required: true, align: 'left', sortable: true },
    {name: 'Gear', label: 'Gear', field: 'Gear', required: true, align: 'left', sortable: true },
    {name: 'Sector', label: 'Sector', field: 'Sector', required: true, align: 'left', sortable: true },
    {name: 'EM_EFP_Number', label: 'EM EFP #', field: 'EM_EFP_Number', required: true, align: 'left', sortable: true },
    {name: 'Notes', label: 'Notes', field: 'Notes', required: true, align: 'left', sortable: true, style: 'width: 100px' },    
]

}
</script>

<style>
.my-special-class {
    width: 100px;
}
</style>



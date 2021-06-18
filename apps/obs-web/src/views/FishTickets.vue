<template>
    <div class="flex flex-center q-pa-md  q-gutter-md">
        {{ ftids }}

        <q-table
            :data="fishTickets"
            :columns="ftColumns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            :loading="ftLoading"
            binary-state-sort
            style="width: 100%"
        >

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="id"></q-td>
                    <q-td key="FTID" :props="props">{{ props.row.FTID }}</q-td>
                    <q-td key="VESSEL_NUM" :props="props">{{ props.row.VESSEL_NUM }}</q-td>
                    <q-td key="CONDITION_CODE" :props="props">{{ props.row.CONDITION_CODE = 'R' ? 'Retained' : 'Discarded' }}</q-td>
                    <q-td key="SPECIES_NAME" :props="props">{{ props.row.SPECIES_NAME }}</q-td>
                    <q-td key="LANDED_WEIGHT_LBS" :props="props">{{ props.row.LANDED_WEIGHT_LBS }}</q-td>
                    <q-td key="NUM_OF_FISH" :props="props">{{ props.row.NUM_OF_FISH }}</q-td>
                </q-tr>
            </template>

        </q-table>

    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onMounted
} from '@vue/composition-api';

import { Vue, Watch } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { getSelections, getOracleWaivers, getFishTicket } from '@boatnet/bn-common';

import { WatchOptions } from 'vue';

import moment from 'moment';

export default createComponent({
    props: {
        id: String,
    },
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;
        const ftids = props.id;

        const masterDB = couchService.masterDB;

        const selected: any = ref([]);
        const pagination = {
            // sortBy: 'period_end',
            descending: true,
            rowsPerPage: 15
            };

        const fishTickets: any = ref([]);

        const ftLoading: any = ref(false);

        const navigateBack = () => {
            router.back();
        };

        const formatDate = (dateTime: string) => {
            return moment(dateTime).format('MM/DD/YYYY');
        };

        const ftColumns = [
            {name: 'FTID', label: 'Fish Ticket #', field: 'FTID', required: true, align: 'left', sortable: true},
            {name: 'VESSEL_NUM', label: 'Vessel ID #', field: 'VESSEL_NUM', required: true, align: 'left', sortable: true},
            {name: 'CONDITION_CODE', label: 'Disposition', field: 'CONDITION_CODE', required: true, align: 'left', sortable: true},
            {name: 'SPECIES_NAME', label: 'SPECIES NAME', field: 'SPECIES_NAME', required: true, align: 'left', sortable: true},
            {name: 'LANDED_WEIGHT_LBS', label: 'Landed LBS', field: 'LANDED_WEIGHT_LBS', required: true, align: 'left', sortable: true},
            {name: 'NUM_OF_FISH', label: 'Count', field: 'NUM_OF_FISH', required: true, align: 'left', sortable: true},
        ];

        const getSpeciesDocs = async (speciesCodes: string | number) => {
            let speciesDocs = [];
            try {
                const speciesQuery = await masterDB.view(
                    'em-views',
                    'wcgopCode-to-pacfinCode-map',
                    {include_docs: true, keys: speciesCodes}
                );
                speciesDocs = speciesQuery.rows.map((row: any) => row.doc);
            } catch (err) {
                console.error(err);
            }
            return speciesDocs;
        };

        const getFishTickets = async () => {
            const ids = ftids!.split(', ');
            for (const id of ids) {
                const ticketRows: any = await getFishTicket(id);
                const speciesDocs = await getSpeciesDocs(ticketRows.map((row: any) => row.PACFIN_SPECIES_CODE));
                for (const row of ticketRows) {
                    row.FTID = id;
                    const species = speciesDocs.find( (speciesRow: any) => speciesRow.pacfinSpeciesCode === row.PACFIN_SPECIES_CODE );
                    console.log(species);
                    row.SPECIES_NAME = species ? species.commonNames[0] : '';
                    fishTickets.value.push(row);
                }
            }
        };

        onMounted( async () => {
            await getFishTickets();
        });

        return {
            formatDate,
            fishTickets,
            ftids,
            ftLoading,
            navigateBack,
            pagination,
            selected,
            ftColumns,
        };
    }
});

</script>

<style scoped>
.break {
    flex-basis: 100%;
    height: 0 !important;
    margin: 0;
    padding: 0;
}

.q-data-table td, .q-data-table th {
    /* don't shorten cell contents */
    white-space: normal !important;
}
</style>

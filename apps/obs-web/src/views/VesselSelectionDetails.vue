<template>
    <div class="flex flex-center q-pa-md  q-gutter-md">
        <p>Vessel: <b>{{ selection.VESSEL_NAME }} ({{ selection.VESSEL_DRVID }})</b></p>
        <p>Permit/License #: <b>{{ selection.LICENSE_NUMBER ? selection.LICENSE_NUMBER :
            selection.PERMIT_NUMBER ? selection.PERMIT_NUMBER :
            selection.PERMIT_NUMBER_2 ? selection.PERMIT_NUMBER_2 :
            'N/A' }}</b>
        </p>
        <p>Status: <b>{{ selection.STATUS_REASON }}</b></p>
        <p>Port Group: <b>{{ selection.PORT_GROUP_CODE }}</b></p>

        <div class="break"></div>

        <p>Fishery: <b>{{ selection.FISHERY }}</b></p>
        <p>Cycle: <b>{{ selection.CYCLE_NUMBER }}</b></p>
        <p>Period: <b>{{ selection.PERIOD_NUMBER }}</b></p>
        <p>Period Start: <b>{{ formatDate(selection.PERIOD_START) }}</b></p>
        <p>Period End: <b>{{ formatDate(selection.PERIOD_END) }}</b></p>

        <div class="break"></div>

        <b>Current Status</b>

        <div class="break"></div>

        <b>Waivers</b>

        <div class="break"></div>

        <q-table
            :data="vesselWaivers"
            :columns="waiversColumns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="waiversPagination"
            :loading="waiversLoading"
            binary-state-sort
            style="width: 100%"
        >

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="id"></q-td>
                    <q-td key="waiverId" :props="props">{{ props.row.waiverId ? props.row.waiverID : props.row.WAIVER_ID }}</q-td>
                    <q-td key="waiverType" :props="props">{{ props.row.waiverType ? props.row.waiverType.description : props.row.WAIVER_TYPE }}</q-td>
                    <q-td key="reason" :props="props">{{ props.row.reason ? props.row.reason.description : props.row.WAIVER_REASON }}</q-td>
                    <q-td key="fishery" :props="props">{{ props.row.fishery ? props.row.fishery.description : props.row.FISHERY ? props.row.FISHERY : '' }}</q-td>
                    <q-td key="certificateNumber" :props="props">{{ props.row.certificateNumber ? props.row.certificateNumber.permitNumber : props.row.PERMIT_OR_LICENSE ? props.row.PERMIT_OR_LICENSE : '' }}</q-td>
                    <q-td key="landingPort" :props="props">{{ props.row.landingPort ? props.row.landingPort.name : props.row.PORT_NAME ? props.row.PORT_NAME : '' }}</q-td>
                    <q-td key="contact" :props="props">{{ props.row.contact ? props.row.contact.firstName + ' ' + props.row.contact.lastName : props.row.CONTACT ? props.row.CONTACT : '' }}</q-td>
                    <q-td key="startDate" :props="props">{{ props.row.startDate ? formatDate(props.row.startDate) : formatDate(props.row.START_DATE)}}</q-td>
                    <q-td key="endDate" :props="props">{{ props.row.endDate ? formatDate(props.row.endDate) : formatDate(props.row.END_DATE) }}</q-td>
                    <q-td key="notes" :props="props">{{ props.row.notes ? props.row.notes : props.row.NOTES }}</q-td>
                </q-tr>
            </template>

        </q-table>

        <div class="break"></div>

        <b>Observed Trips</b>

        <div class="break"></div>

        <q-table
            :data="vesselTrips"
            :columns="tripsColumns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="tripsPagination"
            :loading="tripsLoading"
            binary-state-sort
            style="width: 100%"
        >
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="id"></q-td>
                    <q-td key="fishery" :props="props">{{ props.row.fishery ? props.row.fishery.description : '' }}</q-td>
                    <q-td key="permit" :props="props">{{ props.row.certificates ? getCertificateNumbers(props.row.certificates) : '' }}</q-td>
                    <q-td key="observer" :props="props">{{ props.row.observer ? props.row.observer.firstName + ' ' + props.row.observer.lastName : '' }}</q-td>
                    <q-td key="departureDate" :props="props">{{ formatDate(props.row.departureDate) }}</q-td>
                    <q-td key="returnDate" :props="props">{{ formatDate(props.row.returnDate) }}</q-td>
                    <q-td key="departurePort" :props="props">{{ props.row.departurePort ? props.row.departurePort.name : '' }}</q-td>
                    <q-td key="returnPort" :props="props">{{ props.row.returnPort ? props.row.returnPort.name : '' }}</q-td>
                    <q-td key="fishTickets" :props="props"><q-btn @click="displayFishTickets(props.row.fishTickets)" flat>{{ props.row.fishTickets ? getFishTicketNumbers(props.row.fishTickets) : '' }}</q-btn></q-td>
                </q-tr>
            </template>
        </q-table>

        <div class="break"></div>

        <b>Fish Tickets</b>

        <div class="break"></div>

        <q-table
            :data="vesselFishTickets"
            :columns="fishTicketColumns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="fishTicketsPagination"
            :loading="fishTicketsLoading"
            binary-state-sort
            style="width: 100%"
        >
            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="id"></q-td>
                    <q-td key="FTID" :props="props"><q-btn @click="displayFishTickets([{fishTicketNumber: props.row.FTID}])" flat>{{ props.row.FTID }}</q-btn></q-td>
                    <q-td key="FISHER_LICENSE_NUM" :props="props">{{ props.row.FISHER_LICENSE_NUM }}</q-td>
                    <q-td key="LANDING_DATE" :props="props">{{ formatDate(props.row.LANDING_DATE) }}</q-td>
                    <q-td key="PORT_NAME" :props="props">{{ props.row.PORT_NAME }}</q-td>
                    <q-td key="PACFIN_SPECIES_CODES" :props="props">{{ props.row.PACFIN_SPECIES_CODES }}</q-td>
                    <q-td key="LANDED_WEIGHT_LBS" :props="props">{{ props.row.LANDED_WEIGHT_LBS }}</q-td>
                    <q-td key="DECLARATION_CODES" :props="props">{{ props.row.DECLARATION_CODES }}</q-td>
                    <q-td key="DECLARATION_TYPES" :props="props">{{ props.row.DECLARATION_TYPES }}</q-td>
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
import { getSelections, getOracleWaivers, getFishTicket, getVesselFishTickets } from '@boatnet/bn-common';

import { WatchOptions } from 'vue';

import moment from 'moment';
import { vessel } from '../_store/vessel.module';

export default createComponent({
    props: {
        id: String,
    },
    setup(props, context) {
        const store = context.root.$store;
        const state = store.state;
        const router = context.root.$router;
        const id = props.id;

        const masterDB = couchService.masterDB;

        const selected: any = ref([]);
        const waiversPagination = {
            sortBy: 'period_end',
            descending: true,
            rowsPerPage: 15
            };

        const tripsPagination = {
            sortBy: 'period_end',
            descending: true,
            rowsPerPage: 15
            };

        const fishTicketsPagination = {
            sortBy: 'period_end',
            descending: true,
            rowsPerPage: 100
            };

        const selection: any = ref({});
        const vesselWaivers: any = ref([]);
        const vesselTrips: any = ref([]);
        const vesselFishTickets: any = ref([]);

        const waiversLoading: any = ref(false);
        const tripsLoading: any = ref(false);
        const fishTicketsLoading: any = ref(false);

        const navigateBack = () => {
            router.back();
        };

        const formatDate = (dateTime: string) => {
            return moment.utc(dateTime).format('MM/DD/YYYY');
        };

        const waiversColumns = [
            {name: 'waiverId', label: 'Waiver #', field: 'waiverId', required: true, align: 'left', sortable: true},
            {name: 'waiverType', label: 'Type', field: 'waiverType', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description.toLowerCase() > b.description.toLowerCase()},
            {name: 'reason', label: 'Reason', field: 'reason', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description.toLowerCase() > b.description.toLowerCase()},
            {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.description.toLowerCase() > b.description.toLowerCase()},
            {name: 'certificateNumber', label: 'Permit', field: 'certificateNumber', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.permitNumber.toLowerCase() > b.permitNumber.toLowerCase()},
            {name: 'landingPort', label: 'Port', field: 'landingPort', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.name.toLowerCase() > b.name.toLowerCase()},
            {name: 'contact', label: 'Contact', field: 'contact', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => a.firstName.toLowerCase() > b.firstName.toLowerCase()},
            {name: 'startDate', label: 'Start Date', field: 'startDate', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b)},
            {name: 'endDate', label: 'End Date', field: 'endDate', required: true, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b)},
            {name: 'notes', label: 'Notes', field: 'notes', required: true, align: 'left', sortable: true},
        ];

        const getWaivers = async () => {
            waiversLoading.value = true;
            const waiversQuery = await masterDB.view(
                'obs_web',
                'waivers_by_vesselId',
                {include_docs: true, key: selection.value.VESSEL_DRVID}
            );
            vesselWaivers.value.push.apply(vesselWaivers.value, waiversQuery.rows.filter((row: any) => moment(row.doc.startDate).isSame(selection.value.startDate, 'year') ||  moment(row.doc.endDate).isSame(selection.value.endDate, 'year')).map((row: any) => row.doc));
            const oracleWaivers = await getOracleWaivers(moment(selection.value.PERIOD_END).format('YYYY'), selection.value.VESSEL_DRVID);
            vesselWaivers.value.push.apply(vesselWaivers.value, oracleWaivers);
            waiversLoading.value = false;
        };

        const tripsColumns = [
            {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true},
            {name: 'permit', label: 'Permits', field: 'permit', required: true, align: 'left', sortable: true},
            {name: 'observer', label: 'Observer', field: 'observer', required: true, align: 'left', sortable: true},
            {name: 'departureDate', label: 'Departure Date', field: 'departureDate', required: true, align: 'left', sortable: true},
            {name: 'returnDate', label: 'Return Date', field: 'returnDate', required: true, align: 'left', sortable: true},
            {name: 'departurePort', label: 'Departure Port', field: 'departurePort', required: true, align: 'left', sortable: true},
            {name: 'returnPort', label: 'Return Port', field: 'returnPort', required: true, align: 'left', sortable: true},
            {name: 'fishTickets', label: 'Fish Tickets', field: 'fishTickets', required: true, align: 'left', sortable: true},
        ];

        const getTrips = async () => {
            tripsLoading.value = true;
            const selectionYear = moment(selection.value.PERIOD_END).format('YYYY');
            const tripsQuery = await masterDB.view(
                'obs_web',
                'wcgop_trips_vesselId_returnDate',
                {
                    include_docs: true,
                    start_key: [selection.value.VESSEL_DRVID, moment(selection.value.PERIOD_START).format()],
                    end_key: [selection.value.VESSEL_DRVID, moment(selection.value.PERIOD_END).format()]
                }
            );
            vesselTrips.value.push.apply(vesselTrips.value, tripsQuery.rows.map((row: any) => row.doc));
            tripsLoading.value = false;
        };

        const fishTicketColumns = [
            {name: 'FTID', label: 'Fish Ticket #', field: 'FTID', required: true, align: 'left', sortable: true},
            {name: 'FISHER_LICENSE_NUM', label: 'Permit #', field: 'FISHER_LICENSE_NUM', required: true, align: 'left', sortable: true},
            {name: 'LANDING_DATE', label: 'Landing Date', field: 'LANDING_DATE', required: true, align: 'left', sortable: true},
            {name: 'PORT_NAME', label: 'Landing Port', field: 'PORT_NAME', required: true, align: 'left', sortable: true},
            {name: 'PACFIN_SPECIES_CODES', label: 'Species Codes', field: 'PACFIN_SPECIES_CODES', required: true, align: 'left', sortable: true},
            {name: 'LANDED_WEIGHT_LBS', label: 'Landed Weight (lbs)', field: 'LANDED_WEIGHT_LBS', required: true, align: 'left', sortable: true},
            {name: 'DECLARATION_CODES', label: 'Declaration Codes', field: 'DECLARATION_CODES', required: true, align: 'left', sortable: true},
            {name: 'DECLARATION_TYPES', label: 'Declaration Types', field: 'DECLARATION_TYPES', required: true, align: 'left', sortable: true},
        ];

        const getFishTickets = async () => {
            fishTicketsLoading.value = true;
            const fishTicketRows: any = [];
            const fishTickets: any = await getVesselFishTickets(selection.value.VESSEL_DRVID, selection.value.PERIOD_START, selection.value.PERIOD_END);
            for (const fishTicket of fishTickets) {
                if (!fishTicketRows.filter( (row: any) => row.FTID === fishTicket.FTID)[0]) {
                    fishTicketRows.push(
                        {
                            FTID: fishTicket.FTID,
                            LANDING_DATE: fishTicket.LANDING_DATE,
                            FISHER_LICENSE_NUM: fishTicket.FISHER_LICENSE_NUM,
                            PORT_NAME: fishTicket.PORT_NAME,
                            LANDED_WEIGHT_LBS: fishTicket.LANDED_WEIGHT_LBS,
                            PACFIN_SPECIES_CODES: fishTicket.PACFIN_SPECIES_CODE,
                            VESSEL_NUM: fishTicket.VESSEL_NUM,
                            DECLARATION_CODES: fishTicket.DECLARATION_CODES,
                            DECLARATION_TYPES: fishTicket.DECLARATION_TYPES
                        }
                    );
                } else {
                    const ftRow = fishTicketRows.find( (row: any) => row.FTID === fishTicket.FTID);
                    ftRow.LANDED_WEIGHT_LBS += fishTicket.LANDED_WEIGHT_LBS;
                    if (!ftRow.PACFIN_SPECIES_CODES.includes(fishTicket.PACFIN_SPECIES_CODE)) {
                        ftRow.PACFIN_SPECIES_CODES += (', ' + fishTicket.PACFIN_SPECIES_CODE);
                    }
                }
            }
            vesselFishTickets.value.push.apply(vesselFishTickets.value, fishTicketRows);
            fishTicketsLoading.value = false;
        };

        const getCertificateNumbers = (certificates: any[]) => {
            let returnString = '';
            for (const cert of certificates) {
                returnString += cert.certificateNumber;
                if (certificates.indexOf(cert) !== certificates.length - 1) {
                    returnString += ', ';
                }
            }
            return returnString;
        };

        const getFishTicketNumbers = (fishTickets: any[]) => {
            let returnString = '';
            for (const ticket of fishTickets) {
                returnString += ticket.fishTicketNumber;
                if (fishTickets.indexOf(ticket) !== fishTickets.length - 1) {
                    returnString += ', ';
                }
            }
            return returnString;
        };

        const displayFishTickets = (fishTickets: any) => {
            router.push({path: '/fish-tickets/' + getFishTicketNumbers(fishTickets)});
        };

        onMounted( async () => {
            selection.value = state.vessel.vesselSelection;
            getWaivers();
            getTrips();
            getFishTickets();
        });

        return {
            displayFishTickets,
            fishTicketColumns,
            fishTicketsPagination,
            fishTicketsLoading,
            formatDate,
            getCertificateNumbers,
            getFishTicketNumbers,
            navigateBack,
            selected,
            selection,
            tripsColumns,
            tripsLoading,
            tripsPagination,
            vesselFishTickets,
            vesselTrips,
            vesselWaivers,
            waiversColumns,
            waiversLoading,
            waiversPagination
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

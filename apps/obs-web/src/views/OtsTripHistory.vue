<template>
  <div v-if="trip" style="border: 1px solid grey; border-radius: 10px; margin: 1em; padding: 1em">
        <div class="text-h4">Trip {{ trip.tripNum }} Details</div>
      <div class="row">
          <div class="col" style="margin: 3em">
            <div><b>Vessel Name:</b> {{ trip.vessel.vesselName }}</div>
            <div><b>Vessel Num:</b> {{ trip.vessel.coastGuardNumber ? trip.vessel.coastGuardNumber : trip.vessel.stateRegulationNumber }}</div>
            <div><b>Departure Date:</b> {{ getDate(trip.departureDate) }} </div>
            <div><b>Departure Port:</b> {{ trip.departurePort.name }}</div>
            <div><b>Return Date:</b> {{ getDate(trip.returnDate) }}</div>
            <div><b>Return Port:</b> {{ trip.returnPort.name }}</div>
          </div>
          <div class="col" style="margin: 3em">
            <div><b>Fishery:</b> {{ trip.fishery.description }}</div>
            <div><b>Permits:</b> {{ trip.permits.map( (permit) => permit.permitNumber ) }}</div>
            <div><b>Notes:</b> {{ trip.notes }}</div>
          </div>
          <div class="col" style="margin: 3em">
            <div><b>Created By:</b> {{ trip.createdBy }} </div>
            <div><b>Created Date:</b> {{ getDate(trip.createdDate) }} </div>
            <div><b>Status:</b> {{ trip.tripStatus.description }}</div>
            <div v-if="trip.closingReason"><b>Closing Reason:</b> {{ trip.closingReason }} </div>
          </div>
      </div>

    <div style="margin-left: 3em">
      <div v-if="trip.changeLog">
          <div class="text-h6">Change Log</div>
          <div style="margin-left: 1em">
              <div v-for="item of trip.changeLog" :key="trip.changeLog.indexOf(item)">- {{ item.updateDate }}: <b>{{ item.updatedBy }}</b> {{ item.change }} </div>
          </div>
      </div>

    </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { get, set } from 'lodash';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';

import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import router from 'vue-router';
import _ from 'lodash';
import moment from 'moment';

@Component
export default class OtsTripHistory extends Vue {
    private trip = null;

    private getDate(date: string) {
        return moment(date).format('MM/DD/YYYY');
    }

    private async getTrip(id: string) {
        const masterDB: Client<any> = couchService.masterDB;

        this.trip = await masterDB.get(id);
        console.log(this.trip);
    }

    private created() {
        this.getTrip(this.$route.params.id);

    }
}

</script>

<style scoped>
  .p-inputtext {
    background-color: inherit !important;
  }
</style>
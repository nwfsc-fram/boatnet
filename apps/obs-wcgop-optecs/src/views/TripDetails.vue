<template>
  <q-page padding>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="start">
        <div class="text-h5 row justify-center">Trip #{{tripNum}} Start</div>
        <div class="q-pa-md">
          <!-- WS Note: if you use q-gutter here, it'll make flexbox wrap before col adds up to 12 -->
          <!-- so be sure to use q-col-gutter -->
          <div class="q-col-gutter-md column" style="height:400px; max-height: 100%;">
            <q-input outlined class="col-2" v-model="currentTrip.vessel.name" label="Vessel Name"/>
            <q-input outlined class="col-2" v-model="currentTrip.fishery.name" label="Fishery"/>
            <q-input
              outlined
              class="col-2"
              readonly
              v-model="vesselReg"
              label="USGS / State Reg #"
            />
            <q-input
              outlined
              class="col-2"
              v-model="currentTrip.captain.name"
              label="Skipper's Name"
            />
            <q-input outlined class="col-2" v-model="currentTrip.crewSize" label="# of Crew"/>
            <q-input
              outlined
              class="col-2"
              v-model="currentTrip.observerLogbookNum"
              label="Observer Logbook #"
            />
            <q-input
              outlined
              class="col-2"
              :value="formatDate(currentTrip.departureDate)"
              label="Departure Date/ Time"
            />
            <q-input
              outlined
              class="col-2"
              v-model="currentTrip.departurePort.name"
              label="Departure Port"
            />

            <div class="text-h6 col-2">Permit / License Numbers</div>
            <!-- TODO this should be a component -->
            <div class="row">
              <q-input outlined class="col-12" v-model="ph" label="Permit/ License #"/>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="end">
        <div class="text-h5 row justify-center">Trip #{{tripNum}} End</div>
        <div class="q-pa-md">
          <div class="q-col-gutter-md column" style="height:400px; max-height: 100%;">
            <div class="col-2">
              <div class="text-h8 col-3">Partial Trip</div>
              <q-btn-toggle
                class="col-auto"
                v-model="currentTrip.isPartialTrip"
                toggle-color="primary"
                :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
              />
            </div>

            <div class="col-2">
              <div class="text-h8 col-3">Fish Processed During Trip</div>
              <q-btn-toggle
                class="col-auto"
                v-model="currentTrip.isFishProcessed"
                toggle-color="primary"
                :options="[{label: 'Y', value: true}, {label: 'N', value: false}]"
              />
            </div>

            <q-input
              outlined
              class="col-2"
              v-model="currentTrip.logbookType"
              label="Vessel Logbook Name"
            />
            <q-input
              outlined
              class="col-2"
              v-model="currentTrip.logbookNum"
              label="Vessel Logbook Page #"
            />
            <q-input
              outlined
              class="col-2"
              v-model="currentTrip.returnPort.name"
              label="Return Port"
            />
            <q-input
              outlined
              class="col-2"
              :value="formatDate(currentTrip.returnDate)"
              label="Return Date/Time"
            />
            <q-input outlined class="col-2" :value="firstReceiverName" label="First Receiver"/>
            <div class="text-h6 col-2">Fish Tickets</div>
            <!-- TODO this should be a component -->
            <div class="row">
              <q-input outlined class="col-12" v-model="ph" label="Fish Ticket"/>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <div class="row justify-center">
      <q-option-group
        v-model="tab"
        inline
        :options="[
          { label: '', value: 'start' },
          { label: '', value: 'end' },
        ]"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';

import { Point } from 'geojson';
import {
  WcgopTrip,
  WcgopTripTypeName,
  Port,
  PortTypeName,
  WcgopHaul,
  WcgopHaulTypeName,
  LocationEvent,
  Vessel
} from '@boatnet/bn-models';

import moment from 'moment';

@Component
export default class Trips extends Vue {
  @Prop({ default: 'start' }) public startTab!: string;
  @Prop(Number) private tripNum!: number; // Passed by router

  private tab: string; // Current tab (start or end)

  private currentTrip: WcgopTrip;

  private ph = ''; // TEMP

  constructor() {
    super();
    this.tab = this.startTab;
    const examplePort: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      portId: 'OXNARD-Port',
      name: 'Oxnard'
    };

    const examplePort2: Port = {
      _id: 'asdf',
      type: PortTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      portId: 'Townsend-Port',
      name: 'Port Townsend'
    };

    const exampleVessel: Vessel = {
      name: 'Sadie K',
      uscg: 'ABC123'
    };

    // TODO This is just an example trip
    this.currentTrip = {
      _id: '1',
      tripNum: this.tripNum,
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      program: 'Catch Shares',
      fishery: { name: 'Catch Shares' },
      captain: {
        name: 'Capt. Hook'
      },
      crewSize: 25,
      isPartialTrip: false,
      observerLogbookNum: 123,
      departurePort: examplePort,
      departureDate: moment().format(),
      returnPort: examplePort2,
      returnDate: moment()
        .add(1, 'days')
        .format(),
      vessel: exampleVessel,
      firstReceivers: [{
        name: 'Crangon Seafoods'
      }],
      // ... other data
      legacy: {
        tripId: 123
      }
    };
  }

  get firstReceiverName(): string | undefined {
    if (
      this.currentTrip.firstReceivers &&
      this.currentTrip.firstReceivers.length
    ) {
      return this.currentTrip.firstReceivers[0].name;
    }
  }
  get vesselReg() {
    if (this.currentTrip.vessel) {
      return this.currentTrip.vessel.uscg
        ? this.currentTrip.vessel.uscg
        : this.currentTrip.vessel.stateReg;
    }
  }

  // TODO move to shared util?
  private formatDate(dateStr: string): string {
    return moment(dateStr).format('MM/DD/YY hh:mm');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

<template>
<div>
  <div style="margin: 2px; display: flex; flex-wrap: wrap; justify-content: center">
    <q-card
      style="min-width: 350px; max-width: 400px; margin: 1px"
      class="q-pa-sm"
      v-for="attribute in tripDoc.tripAttributes"
      :key="tripDoc.tripAttributes.indexOf(attribute)"
    >
      <div v-if="attribute.displayAs === 'buttons'">
        <div style="font-weight: bold; white-space: nowrap">{{ attribute.displayName }}</div>
        <q-btn-toggle
          :options="attribute.options"
          v-model="trip[attribute.modelName]"
          outlined
          spread
          unelevated
          color="grey-6"
          style="height: 40px"
        ></q-btn-toggle>
      </div>

      <div v-if="attribute.displayAs === 'text'">
            <div style="font-weight: bold; white-space: nowrap">{{ attribute.displayName }}</div>
            <q-input v-model="trip[attribute.modelName]" outlined dense></q-input>
      </div>

      <div v-if="attribute.displayAs === 'number'">
        <div style="font-weight: bold; white-space: nowrap">{{ attribute.displayName }}</div>
        <q-input v-model="trip[attribute.modelName]" outlined dense></q-input>
      </div>

      <div v-if="attribute.displayAs === 'select'">
        <div style="font-weight: bold; white-space: nowrap">{{ attribute.displayName }}</div>
        <q-select :options="attribute.options" v-model="trip[attribute.modelName]" outlined dense></q-select>
      </div>

      <div v-if="attribute.displayAs === 'datetime'">
        <div style="font-weight: bold; white-space: nowrap">{{ attribute.displayName }}</div>
        <pCalendar v-model="trip[attribute.modelName]" :showTime="true" onfocus="blur()"></pCalendar>
      </div>

      <div v-if="attribute.displayAs === 'stringArray'">
        <div style="font-weight: bold; white-space: nowrap">{{ attribute.displayName }}</div>
          <boatnet-licenses
            :certificates.sync="trip.certificates"
          />
      </div>

      <div v-if="attribute.displayAs === 'spacer'">
        &nbsp;
      </div>
    </q-card>

    <div style="position: absolute; bottom: 10%" v-if="tripDoc.tripAttributes.length > 10">
        <q-btn flat dense round icon="chevron_left" size="3em"/>
        <q-btn flat dense round icon="chevron_right" size="3em"/>
    </div>
  </div>

  </div>
</template>

<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { pouchService } from '@boatnet/bn-pouch';
import {
  WcgopTrip,
  WcgopTripTypeName,
  WcgopFishTicket,
  Port,
  PortTypeName,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  Vessel,
  Person,
  PersonTypeName,
  VesselTypeName,
  Certificate
} from '@boatnet/bn-models';

import { couchService } from '@boatnet/bn-couch';
import BoatnetLicenses from '@boatnet/bn-common';
import BoatnetDatetime from '@boatnet/bn-common';
import BoatnetFishTickets from '@boatnet/bn-common';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

@Component
export default class DynamicTripDetails extends Vue {
  @Prop(Number) public tripNum!: number; // Passed by router
  public model: any = null;
  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('save', { namespace: 'appState' })
  private saveTrip: any;
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTripState!: WcgopTrip;
  @Action('setCurrentTrip', { namespace: 'appState' })
  private setCurrentTrip: any;

  private options: string[] = ['ace', 'joy ann', 'fishwish', 'fishbuster'];

  private trip = {};

  private tripDoc = {
    name: 'Wcgop',
    tripAttributes: [
      {
        displayName: 'Gear Type',
        modelName: 'gearType',
        type: 'lookup',
        options: [
          { label: 'Trawl', value: 'trawl' },
          { label: 'Fixed Gear', value: 'fixed' }
        ],
        displayAs: 'buttons',
        isDisplayColumn: 'false',
        required: 'false',
        validations: ''
      },
      {
        displayName: 'Vessel Name / Registration',
        modelName: 'vessel.vesselName',
        view: 'vessels',
        options: ['ace', 'joy ann', 'fishwish', 'fishbuster'],
        type: 'pouchLookup',
        displayAs: 'select',
        isDisplayColumn: 'true',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'Skipper\'s Name',
        modelName: 'captainName',
        type: 'text',
        displayAs: 'text',
        isDisplayColumn: 'false',
        required: 'true',
        validations: ''
      },
      {
        displayName: '# of Crew',
        modelName: 'crewSize',
        type: 'number',
        displayAs: 'number',
        isDisplayColumn: 'false',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'Observer Logbook #',
        modelName: 'logbookNum',
        type: 'number',
        displayAs: 'number',
        isDisplayColumn: 'false',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'spacer',
        modelName: 'spacer',
        type: 'spacer',
        displayAs: 'spacer',
        isDisplayColumn: 'false',
        required: 'false',
        validations: ''
      },
      {
        displayName: 'Departure Date / Time',
        modelName: 'departureDate',
        type: 'datetime',
        displayAs: 'datetime',
        isDisplayColumn: 'false',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'Return Date / Time',
        modelName: 'returnDate',
        type: 'datetime',
        displayAs: 'datetime',
        isDisplayColumn: 'false',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'Partial Trip',
        modelName: 'isPartialTrip',
        type: 'lookup',
        options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
        displayAs: 'buttons',
        isDisplayColumn: 'false',
        required: 'false',
        validations: ''
      },
      {
        displayName: 'Departure Port',
        modelName: 'departurePort',
        options: ['Newport', 'Seattle', 'Gray\'s harbor'],
        type: 'select',
        displayAs: 'select',
        isDisplayColumn: 'true',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'Return Port',
        modelName: 'returnPort',
        options: ['Newport', 'Seattle', 'Gray\'s harbor', 'Same as Start'],
        type: 'select',
        displayAs: 'select',
        isDisplayColumn: 'true',
        required: 'true',
        validations: ''
      },
      {
        displayName: 'Permit / License Number',
        modelName: 'certificates',
        type: 'string array',
        displayAs: 'stringArray',
        isDisplayColumn: 'false',
        required: 'false',
        validations: ''
      },
    ]
  };

  constructor() {
    super();
  }
}
</script>

<style>
.p-datepicker-inline {
  border: none;
}

.p-calendar,
.p-inputtext {
  width: 100%;
  height: 40px;
}
</style>
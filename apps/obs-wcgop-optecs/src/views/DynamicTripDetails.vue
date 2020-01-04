<template>
  <div>
    <q-expansion-item
      v-model="start"
      expand-separator
      label="Trip Start"
      header-class="bg-primary text-white text-bold"
      expand-icon-class="text-white"
      icon="far fa-clock"
    >
      <div style="margin: 2px; display: flex; flex-wrap: wrap; justify-content: center">
        <div
          v-for="attribute in tripDoc.tripAttributes"
          :key="tripDoc.tripAttributes.indexOf(attribute)"
        >
          <q-card
            v-if="attribute.displayAs === 'buttons' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style=" white-space: nowrap;"
            >
              {{ attribute.displayName }}
            </div>
            <q-btn-toggle
              v-model="trip[attribute.modelName]"
              :options="attribute.options"
              outlined
              spread
              unelevated
              color="grey-6"
              style="height: 40px"
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'text' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-input
              v-model="trip[attribute.modelName]"
              dense
              outlined
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'number' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-input
              v-model="trip[attribute.modelName]"
              dense
              outlined
            >
              <template slot="append">
                <q-icon
                  flat
                  name="add_circle"
                  @click="trip[attribute.modelName] += 1"
                />
              </template>
              <template slot="append">
                <q-icon
                  flat
                  name="remove_circle"
                  @click="trip[attribute.modelName] -= 1"
                />
              </template>
            </q-input>
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'select' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px;"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-select
              v-model="trip[attribute.modelName]"
              :options="attribute.options"
              outlined
              dense
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'datetime' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <pCalendar
              v-model="trip[attribute.modelName]"
              :show-time="true"
              onfocus="blur()"
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'stringArray' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px; min-height: 70px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <boatnet-licenses
              :certificates.sync="trip.certificates"
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'calculated' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px; height: 76px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <div>{{ getCalculatedValue(attribute) }}</div>
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'spacer' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px; height: 76px"
          >
        &nbsp;
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'display' && attribute.phase === 'start'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px; height: 76px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <div>{{ attribute.value }}</div>
          </q-card>
        </div>
      </div>
    </q-expansion-item>
    <q-expansion-item
      v-model="end"
      expand-separator
      label="Trip End"
      header-class="bg-primary text-white text-bold"
      expand-icon-class="text-white"
      icon="fas fa-clock"
    >
      <div style="margin: 2px; display: flex; flex-wrap: wrap; justify-content: center">
        <div
          v-for="attribute in tripDoc.tripAttributes"
          :key="tripDoc.tripAttributes.indexOf(attribute)"
        >
          <q-card
            v-if="attribute.displayAs === 'buttons' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style=" white-space: nowrap;"
            >
              {{ attribute.displayName }}
            </div>
            <q-btn-toggle
              v-model="trip[attribute.modelName]"
              :options="attribute.options"
              outlined
              spread
              unelevated
              color="grey-6"
              style="height: 40px"
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'text' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-input
              v-model="trip[attribute.modelName]"
              dense
              outlined
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'number' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-input
              v-model="trip[attribute.modelName]"
              dense
              outlined
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'select' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-select
              v-model="trip[attribute.modelName]"
              :options="attribute.options"
              outlined
              dense
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'datetime' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <pCalendar
              v-model="trip[attribute.modelName]"
              :show-time="true"
              onfocus="blur()"
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'stringArray' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-h6"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <boatnet-licenses
              :certificates.sync="trip.certificates"
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'calculated' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <div>{{ getCalculatedValue(attribute) }}</div>
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'spacer' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
        &nbsp;
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'display' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <div>{{ attribute.value }}</div>
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'slider' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <q-slider
              v-model="trip[attribute.modelName]"
              :min="attribute.min"
              :max="attribute.max"
              label-always
            />
          </q-card>

          <q-card
            v-if="attribute.displayAs === 'fishTickets' && attribute.phase === 'end'"
            class="q-pa-sm"
            style="width: 250px; margin: 1px"
          >
            <div
              class="text-bold"
              style="white-space: nowrap"
            >
              {{ attribute.displayName }}
            </div>
            <boatnet-fish-tickets
              :fish-tickets.sync="trip.fishTickets"
            />
          </q-card>
        </div>
      </div>
    </q-expansion-item>
  </div>
</template>

<script lang="ts">
import { Point } from 'geojson';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { AlertState } from '@boatnet/bn-common';
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
  Certificate,
  Permit
} from '@boatnet/bn-models';

import { couchService } from '@boatnet/bn-couch';
import BoatnetLicenses from '@boatnet/bn-common';
import BoatnetDatetime from '@boatnet/bn-common';
import BoatnetFishTickets from '@boatnet/bn-common';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

interface Trip {
  gearType?: string;
  vessel?: any;
  captainName?: string;
  crewSize?: number;
  logbookNum?: number;
  departureDate?: any;
  departurePort?: Port;
  certificates?: Permit[];
  isPartialTrip?: boolean;
  isFishProcessed?: boolean;
  returnDate?: any;
  returnPort?: Port;
  logbookType?: string;
  firstReceiverName?: string;
  fishTickets?: any[];
  sliderNumber?: number;
  [key: string]: any;
}

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

  private trip: Trip = {
    crewSize: 0,
    logbookNum: 0,
    sliderValue: 0
  };
  private start = true;

  private tripDoc = {
    name: 'WCGOP',
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
        validations: '',
        phase: 'start'
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
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Skipper\'s Name',
        modelName: 'captainName',
        type: 'text',
        displayAs: 'text',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'start'
      },
      {
        displayName: '# of Crew',
        modelName: 'crewSize',
        type: 'number',
        displayAs: 'number',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Observer Logbook #',
        modelName: 'logbookNum',
        type: 'number',
        displayAs: 'number',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'spacer',
        modelName: 'spacer',
        type: 'spacer',
        displayAs: 'spacer',
        isDisplayColumn: 'false',
        required: 'false',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Departure Date / Time',
        modelName: 'departureDate',
        type: 'datetime',
        displayAs: 'datetime',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Departure Port',
        modelName: 'departurePort',
        options: ['Newport', 'Seattle', 'Gray\'s harbor'],
        type: 'select',
        displayAs: 'select',
        isDisplayColumn: 'true',
        required: 'true',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Permit / License Number',
        modelName: 'certificates',
        type: 'string array',
        displayAs: 'stringArray',
        isDisplayColumn: 'false',
        required: 'false',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Calculated Value',
        modelNames: ['crewSize', 'logbookNum'],
        operation: 'multiply',
        type: 'calculated',
        displayAs: 'calculated',
        isDisplayColumn: 'false',
        required: 'false',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Display Only',
        value: 'Some on screen guidance',
        type: 'display',
        displayAs: 'display',
        isDisplayColumn: 'false',
        required: 'false',
        validations: '',
        phase: 'start'
      },
      {
        displayName: 'Partial Trip',
        modelName: 'isPartialTrip',
        type: 'lookup',
        options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
        displayAs: 'buttons',
        isDisplayColumn: 'false',
        required: 'false',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'Fish Processed During Trip',
        modelName: 'isFishProcessed',
        type: 'lookup',
        options: [{ label: 'Yes', value: true }, { label: 'No', value: false }],
        displayAs: 'buttons',
        isDisplayColumn: 'false',
        required: 'false',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'Return Date / Time',
        modelName: 'returnDate',
        type: 'datetime',
        displayAs: 'datetime',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'Return Port',
        modelName: 'returnPort',
        options: ['Newport', 'Seattle', 'Gray\'s harbor', 'Same as Start'],
        type: 'select',
        displayAs: 'select',
        isDisplayColumn: 'true',
        required: 'true',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'Logbook Name',
        modelName: 'logbookType',
        type: 'text',
        displayAs: 'text',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'First Receiver',
        modelName: 'firstReceiverName',
        type: 'text',
        displayAs: 'text',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'Slider',
        modelName: 'sliderValue',
        min: 0,
        max: 15,
        type: 'number',
        displayAs: 'slider',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'end'
      },
      {
        displayName: 'Fish Tickets',
        modelName: 'fishTickets',
        type: 'fishTickets',
        displayAs: 'fishTickets',
        isDisplayColumn: 'false',
        required: 'true',
        validations: '',
        phase: 'end'
      },
    ]
  };

  constructor() {
    super();
  }

  private getCalculatedValue(attribute: any) {
    const a: string = attribute.modelNames[0];
    const b: string = attribute.modelNames[1];
    switch (attribute.operation) {
      case 'multiply':
        return this.trip[a] * this.trip[b];
    }

    }

  private get end() {
    return !this.start;
  }

  private set end(start) {
    this.start = !this.start;
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
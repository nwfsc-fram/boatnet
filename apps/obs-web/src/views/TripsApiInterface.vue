<template>
    <div class="q-pa-md q-gutter-md" style="max-width: 450px">
        <q-btn-toggle
            v-model="mode"
            toggle-color="primary"
            :options="[
                {label: 'New', value: 'new'},
                {label: 'Edit', value: 'edit'},
                {label: 'Get', value: 'get'},
                {label: 'Find', value: 'find'}
            ]"
            @input="clearTrip"
          >
          </q-btn-toggle>

              <div class="row" v-if="['edit', 'get'].includes(mode)">
                <q-input class="col8" label="Trip Num" outlined dense mask="######" v-model="tripNum" v-on:keyup.enter="getTrip"></q-input>
                <q-btn class="col4" label="load" color="primary" style="margin-left: 10px;" @click="getTrip"></q-btn>
                <br>
              </div>

              <div class="q-gutter-md" v-if="['new', 'edit'].includes(mode)">
                <q-input v-model="trip.vesselId" label="Vessel Id" outlined dense debounce="500" :readonly="mode === 'edit'" @input="getVessel"></q-input>
                <span v-if="validVesselId" class="text-primary" style="float: right"><b>* Valid Vessel ID</b></span>
                <q-input v-model="trip.vesselName" label="Vessel Name" outlined dense :readonly="mode === 'edit' || validVesselId"></q-input>
                  <div class="row items-start no-wrap">
                    <pCalendar
                      id="departDate"
                      v-model="tripDates[0]"
                      :inline="false"
                      selectionMode="single"
                      :selectOtherMonths="true"
                      onfocus="blur();"
                      :showTime="true"
                      @input="setTripDates"
                      :rules="[val => !!val || 'Departure Date/Time is required']"
                      >
                    </pCalendar>
                    <label for="departdate" class="calendar-label">Departure Date/Time (Required)</label>
                  </div>
                  <q-select
                    v-model="trip.departurePort"
                    dense
                    outlined
                    use-input
                    label="Departure Port"
                    :options="portOptions"
                    @filter="portsFilterFn"
                    :option-label="opt => opt.description + ' (' + opt.lookupValue + ')'"
                    :option-value="opt => opt.lookupValue"
                    emit-value
                    :display-value="trip.departurePort"
                  ></q-select>
                  <div class=" row items-start no-wrap">
                    <pCalendar
                      id="returnDate"
                      v-model="tripDates[1]"
                      :inline="false"
                      selectionMode="single"
                      :selectOtherMonths="true"
                      onfocus="blur();"
                      :showTime="true"
                      @input="setTripDates"
                      :rules="[val => !!val || 'Return Date/Time is required']"
                      >
                    </pCalendar>
                    <label for="returndate" class="calendar-label">Return Date/Time (Required)</label>
                  </div>
                  <q-select
                    v-model="trip.returnPort"
                    dense
                    outlined
                    use-input
                    label="Return Port"
                    :options="portOptions"
                    @filter="portsFilterFn"
                    :option-label="opt => opt.description + ' (' + opt.lookupValue + ')'"
                    :option-value="opt => opt.lookupValue"
                    emit-value
                    :display-value="trip.returnPort"
                  ></q-select>
                  <q-btn label="submit" @click="submitTrip" color="primary"></q-btn>
              </div>
              <div class="q-pa-md bg-grey-3 rounded-borders" v-if="Object.keys(trip).length > 0">{{ trip }}</div>
              <div v-if="mode === 'find'">
                <q-input
                  label="Query String"
                  v-model="queryString"
                  outlined
                  dense
                  autocorrect="off" autocapitalize="off" spellcheck="false"
                  placeholder="eg.: ?vesselId=123456&departureDate=2020-06-26T02:03:00-07:00"
                  hint="options: vesselId, vesselName, departureDate, departurePort, returnDate, returnPort, fishery, permit"
                  v-on:keyup.enter="getTrips"
                ></q-input>
                <br>
                <p><i>(Click 'find' with no Query String to return all trips for all vessels.)</i></p>
                <q-btn label="find" color="primary" @click="getTrips"></q-btn>
                <br><br>
                <div class="q-pa-md bg-grey-3 rounded-borders" v-if="trips.length > 0">
                  {{ trips }}
                </div>
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
  onMounted
} from '@vue/composition-api';

import { Vue, Watch } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { WatchOptions } from 'vue';

import { Notify } from 'quasar';
import moment from 'moment';

import _ from 'lodash';
import request from 'request';

import { getTripsApiTrip, getCatchApiCatch, newTripsApiTrip } from '@boatnet/bn-common';
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
  setup(props, context) {
      const mode = ref('new');
      const trip: any = ref({});
      const tripNum = ref('');
      const tripDates: any = ref([]);
      const trips: any = ref([]);
      const queryString: any = ref('');
      const validVesselId: any = ref(false);

      const getTripsApiUrl = () => {
        return authService.getTripsApiUrl() + '/api/v1/trips';
      };

      function getJwt() {
          return authService.getCurrentUser()!.jwtToken;
      }

      const setTripDates = () => {
        if (tripDates.value[0]) {
          trip.value.departureDate = moment(tripDates.value[0]).format();
        }
        if (tripDates.value[1]) {
          trip.value.returnDate = moment(tripDates.value[1]).format();
        }
      };

      const portOptions: any = ref([]);

      const getPorts = async () => {
        const masterDb = couchService.masterDB;
        const queryOptions = {
          reduce: false,
          include_docs: false,
          key: 'port'
        };

        const ports = await masterDb.view(
          'TripsApi',
          'all_trips_lookups',
          queryOptions
        );

        portOptions.value = ports.rows.map( (row: any) => {
          return {description: row.value[0], lookupValue: row.value[1]};
          })
        ;

        portOptions.value.sort((a: any, b: any) => {
          if (a.description > b.description) {
            return 1;
          } else if (a.description < b.description) {
            return -1;
          } else {
            return 0;
          }
        });
      };

      const portsFilterFn = (val: string, update: any, abort: any) => {
          update(() => {
            if (val !== '') {
              portOptions.value = portOptions.value.filter((port: any) => {
                return (
                  port.description.includes(val.toUpperCase()) ||
                  port.lookupValue.includes(val.toUpperCase())
                );
              });
            }
          });
          return;
      };

      const updateTripsApiTrip = (activeTrip: any) => {
        return new Promise(async (resolve, reject) => {

            const tripsApiTrip: any = await getTripsApiTrip(activeTrip.tripNum);
            const queryUrl = getTripsApiUrl() + '/' + activeTrip.tripNum;

            request.put(
                {
                    url: queryUrl,
                    json: true,
                    headers: {
                        authorization: 'Token ' + getJwt(),
                    },
                    body: trip.value
                }, (err: any, response: any, body: any) => {
                    if (!err && response.statusCode === 200) {
                        resolve(body);
                    } else {
                        reject(body);
                    }
                }
            );
        });
      };

      const submitTrip = async () => {
        if (!trip.value.vesselId) {
          Notify.create({
            message: 'Vessel Id is required'
          });
          return;
        }
        if (!trip.value.departureDate) {
          Notify.create({
            message: 'Departure Date/Time is required'
          });
          return;
        }
        if (!trip.value.returnDate) {
          Notify.create({
            message: 'Return Date/Time is required'
          });
          return;
        }

        if (trip.value._id) {
          try {
            await updateTripsApiTrip(trip.value);
            Notify.create({
              message: 'Trip successfully updated'
            });
          } catch (err) {
            Notify.create({
              message: err
            });
          }
        } else {
          try {
            await newTripsApiTrip(trip.value);
            Notify.create({
              message: 'New trip successfully submitted'
            });
          } catch (err) {
            Notify.create({
              message: err
            });
          }
        }
      };

      const getTrips = async () => {
        trips.value = await getTripsApiTrips();
      };

      const getTrip = async () => {
        tripDates.value = [];
        trip.value = await getTripsApiTrip(parseInt(tripNum.value, 10));
        if (trip.value.departureDate) {
          tripDates.value[0] = new Date(moment(trip.value.departureDate).format());
        }
        if (trip.value.returnDate) {
          tripDates.value[1] = new Date(moment(trip.value.returnDate).format());
        }
      };

      const getTripsApiTrips = () => {
          return new Promise( (resolve, reject) => {
              const queryUrl = getTripsApiUrl() + queryString.value;
              request.get(
                  {
                      url: queryUrl,
                      json: true,
                      headers: {
                          authorization: 'Token ' + getJwt()
                      }
                  }, (err: any, response: any, body: any) => {
                      if (!err && response.statusCode === 200) {
                          resolve(body);
                      } else {
                          reject(body);
                      }
                  }
              );
          });
      };

      const clearTrip = () => {
          trip.value = {};
          tripNum.value = '';
          tripDates.value = [];
          trips.value = [];
          queryString.value = '';
      };

      const getVessel = async () => {
        if (mode.value === 'new') {
          validVesselId.value = false;
          const masterDev = couchService.masterDB;
          const vesselsQuery = await masterDev.view(
            'obs_web',
            'all_vessel_nums',
            {reduce: false, include_docs: true, key: trip.value.vesselId}
          );
          if (vesselsQuery.rows[0] && vesselsQuery.rows[0].doc.vesselName) {
            validVesselId.value = true;
            Vue.set(trip.value, 'vesselName', vesselsQuery.rows[0].doc.vesselName);
          }
        }
      };

      onMounted(
        () => {
          getPorts();
        }
      );

      return {
          mode, trip, trips, tripNum, tripDates, setTripDates, portOptions, portsFilterFn, submitTrip, queryString, getTrips, getTrip, clearTrip, getVessel, validVesselId      };
    }
});
</script>

<style scoped>

.calendar-logbook-element {
  width: 100%;
  max-width: 350px;
  margin: 5px 5px 5px 0 !important;
}

.fish-ticket-calendar {
  width: 45% !important;
}

* >>> .fish-ticket-calendar .p-inputtext {
  width: 100% !important;
}

.fishticket-calendar-label {
   font-size: 11px;
   position: relative;
   left: -140px;
   top: 3px;
   z-index: 999;
   white-space: nowrap;
}

.list-item {
  margin: 5px 0
}

.calendar-label {
   font-size: 11px;
   position: relative;
   left: -372px;
   top: 3px;
   z-index: 999;
   white-space: nowrap;
   color: #007EC6;
}

.no-wrap {
  flex-wrap: none !important;
}

.selected {
  background-color: #a5b3bb !important;
  color: white;
}
.q-field--with-bottom {
    padding-bottom: 5px !important;
}

* >>> .q-field__bottom {
  /* color: red; */
  font-weight: bolder;
  position: relative;
  top: -30px
}

* >>> .p-inputtext {
  vertical-align: baseline;
  font-weight: bold !important;
  width: 385px;
  border: 1px solid rgb(187, 186, 186) !important;
  border-radius: 4px;
  height: 39px;
  padding-top: 16px;
}

* >>> .p-inputtext:hover {
  border: 1px solid black !important;
}

* >>> .p-inputtext:focus {
  border: none !important;
}

</style>
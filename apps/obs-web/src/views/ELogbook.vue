<template>
  <div class="q-ma-md" v-if="tripCatch">
    <div
      class="text-h4 bg-secondary text-white"
      style="border-radius: 5px; padding: 10px; margin: 5px"
    >
      <q-icon name="fa fa-ship" />
      Trip {{tripCatch.tripNum}}
      <span v-if="selectedHaul">
        &nbsp;
        <q-icon name="fa fa-layer-group" />
        Haul {{ selectedHaul }}
      </span>
      <span v-if="selectedCatch">
        &nbsp;
        <q-icon name="fa fa-fish" />
        {{ tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode ? tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode.commonName : '' }} -
        {{ tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].catchDisposition }}
      </span>
    </div>
    <q-expansion-item
      class="text-primary"
      expand-separator
      icon="fa fa-ship"
      label="Trip Details"
      default-opened
    >
      <div class="row items-start">
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.vesselName"
            outlined
            dense
            autogrow
            label="Vessel Name"
            title="Name of the fishing vessel"
          ></q-input>
        </div>
        <div class="row items-start logbook-element">
          <q-field
            v-model="tripCatch.departureDateTime"
            dense
            autogrow
            outlined
            label="Departure Date"
            title="Date/Time the vessel departed port"
            style="width: 46%; margin-right: 5px"
          >
            <q-popup-proxy ref="qDateProxy1" transition-show="scale" transition-hide="scale">
              <q-date
                v-model="tripCatch.departureDateTime"
                @input="() => {departureTime = '', $refs.qDateProxy1.hide()}"
              />
            </q-popup-proxy>
            <template v-slot:control>{{ formatDate(tripCatch.departureDateTime) }}</template>
          </q-field>

          <q-input
            v-model="departureTime"
            dense
            autogrow
            outlined
            debounce="300"
            label="Time"
            title="Time the vessel departed port"
            mask="##:##"
            :rules="[val => val.split(':')[0] < 24 || 'invalid hour', val => val.split(':')[1] < 60 || 'invalid minute']"
            style="padding-bottom: 0 !important; width: 52%"
          ></q-input>
        </div>

        <div class="row items-start logbook-element">
          <q-select
            v-model="tripCatch.departureState"
            dense
            outlined
            autogrow
            label="Depart State"
            title="State where the vessel departed for fishing activities (WA, OR, CA)"
            style="width: 42%; margin-right: 5px"
            :options="['CA','OR', 'WA']"
          ></q-select>

          <q-select
            v-model="tripCatch.departurePortCode"
            dense
            autogrow
            outlined
            use-input
            label="Port Code"
            title="Port code where the vessel departed. The port code is the same as the PacFIN port code"
            style="width: 56.3%"
            :options="portOptions"
            :option-label="opt => opt.NAME + ' (' + opt.PCID + ')'"
            :option-value="opt => opt.PCID"
            @filter="departurePortFilterFn"
            emit-value
            :display-value="tripCatch.departurePortCode"
          ></q-select>
        </div>
      </div>
      <div class="row items-start">
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.vesselNumber"
            outlined
            dense
            autogrow
            label="Vessel Number"
            title="Vessel Coast Guard or State Reg Number"
          ></q-input>
        </div>
        <div class="row items-start logbook-element">
          <q-field
            v-model="tripCatch.returnDateTime"
            dense
            autogrow
            outlined
            label="Return Date"
            title="Date/Time the vessel returned to port for offload"
            style="width: 46%; margin-right: 5px"
          >
            <q-popup-proxy ref="qDateProxy2" transition-show="scale" transition-hide="scale">
              <q-date
                v-model="tripCatch.returnDateTime"
                @input="() => {returnTime = '', $refs.qDateProxy2.hide()}"
              />
            </q-popup-proxy>
            <template v-slot:control>{{ formatDate(tripCatch.returnDateTime) }}</template>
          </q-field>
          <q-input
            v-model="returnTime"
            dense
            outlined
            debounce="300"
            label="Time"
            title="Time the vessel returned to port"
            mask="##:##"
            :rules="[val => val.split(':')[0] < 24 || 'invalid hour', val => val.split(':')[1] < 60 || 'invalid minute']"
            style="padding-bottom: 0 !important; width: 52%"
          ></q-input>
        </div>
        <div class="row items-start logbook-element">
          <q-select
            v-model="tripCatch.returnState"
            outlined
            dense
            autogrow
            label="Return State"
            title="State where the vessel returned for fishing activities (WA, OR, CA)"
            style="width: 42%; margin-right: 5px"
            :options="['CA', 'OR', 'WA']"
          ></q-select>

          <q-select
            v-model="tripCatch.returnPortCode"
            dense
            autogrow
            outlined
            use-input
            label="Port Code"
            title="Port code where the vessel departed. The port code is the same as the PacFIN port code"
            style="width: 56.3%"
            :options="portOptions"
            :option-label="opt => opt.NAME + ' (' + opt.PCID + ')'"
            :option-value="opt => opt.PCID"
            @filter="returnPortFilterFn"
            emit-value
            :display-value="tripCatch.returnPortCode"
          ></q-select>
        </div>
      </div>
      <div class="row items-start">
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.crewSize"
            dense
            outlined
            label="Crew Size (Incl Captain)"
            title="Total number of crew on board the vessel"
          ></q-input>
        </div>

        <div
          class="logbook-element"
          style="padding: 0 10px; border: solid 1px #C0C0C0; border-radius: 4px; margin-bottom: 5px; min-height: 40px"
        >
          <div>
            <div style="color: #007EC6">
              Buyers
              <span>
                <q-btn flat icon="add" color="primary" size="sm" @click="tripCatch.buyers.push('')"></q-btn>
              </span>
            </div>

            <div v-for="(buyer, i) in tripCatch.buyers" :key="i">
              <q-input
                v-model="tripCatch.buyers[i]"
                dense
                autogrow
                outlined
                title="IFQ Dealer where the vessel offloaded"
              >
                <q-btn flat dense icon="close" @click="tripCatch.buyers.splice(i , 1)"></q-btn>
              </q-input>
            </div>
          </div>
        </div>

        <div class="logbook-element">
          <q-input
            v-model="tripCatch.tripNum"
            outlined
            dense
            readonly
            disabled
            autogrow
            label="Trip # (read only)"
            title="Unique 6 digit Trip id - generated by Trips API"
          ></q-input>
        </div>
      </div>
      <div class="row items-start">
        <div class="logbook-element">
          <q-field
            v-model="tripCatch.isEFPTrip"
            class="text-primary"
            outlined
            dense
            autogrow
            title="Y/N flag indicating if the trip was an EFP trip"
          >
            <template v-slot:control>
              <span>EFP TRIP?</span>&nbsp;
              <q-btn
                :class="getClass('isEFPTrip', 'yes')"
                size="sm"
                label="Yes"
                @click="tripCatch.isEFPTrip = true"
              ></q-btn>&nbsp;
              <q-btn
                :class="getClass('isEFPTrip', 'no')"
                size="sm"
                label="No"
                @click="tripCatch.isEFPTrip = false"
              ></q-btn>
            </template>
          </q-field>
        </div>
        <div class="logbook-element">
          <q-field
            v-model="tripCatch.isObserved"
            class="text-primary"
            outlined
            dense
            autogrow
            title="Y/N flag indicating if a scientific observer was on board"
          >
            <template v-slot:control>
              <span>Observed?</span>&nbsp;
              <q-btn
                :class="getClass('isObserved', 'yes')"
                size="sm"
                label="Yes"
                @click="tripCatch.isObserved = true"
              ></q-btn>&nbsp;
              <q-btn
                :class="getClass('isObserved', 'no')"
                size="sm"
                label="No"
                @click="tripCatch.isObserved = false"
              ></q-btn>
            </template>
          </q-field>
        </div>
      </div>
      <div class="row items-start">
        <div class="logbook-element">
          <q-select
            v-model="tripCatch.fishery"
            dense
            autogrow
            outlined
            label="Fishery"
            title="Description of the EM fishery. Whiting, Midwater Rockfish, Fixed Gear, Bottom Trawl"
            :options="fisheryOptions"
          ></q-select>
        </div>
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.permitNumber"
            dense
            autogrow
            outlined
            label="Permit Number"
            title="Limited Entry permit number (GF0000)"
          ></q-input>
        </div>
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.skipperName"
            dense
            autogrow
            outlined
            label="Skipper"
            title="Name of the vessel captain"
          ></q-input>
        </div>
      </div>
      <div class="row items-start">
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.logbookPageNumber"
            dense
            autogrow
            outlined
            label="Logbook Page #"
            title="Page number from vessel logbook"
          ></q-input>

          <q-input
            v-model="tripCatch.comment"
            dense
            autogrow
            outlined
            label="Comments"
            title="Notes from the logbook"
          ></q-input>
        </div>
        <div class="logbook-element">
          <q-field
            v-model="tripCatch.isSigned"
            class="text-primary"
            outlined
            dense
            autogrow
            title="Y/N flag inidicating if the logbook was signed"
          >
            <template v-slot:control>
              <span>Is Signed?</span>&nbsp;
              <q-btn
                :class="getClass('isSigned', 'yes')"
                size="sm"
                label="Yes"
                @click="tripCatch.isSigned = true"
              ></q-btn>&nbsp;
              <q-btn
                :class="getClass('isSigned', 'no')"
                size="sm"
                label="No"
                @click="tripCatch.isSigned = false"
              ></q-btn>
            </template>
          </q-field>
        </div>

        <div
          class="logbook-element"
          style="padding: 0 10px; border: solid 1px #C0C0C0; border-radius: 4px; margin-bottom: 5px"
        >
          <div>
            <div style="color: #007EC6">
              Fish Tickets
              <span>
                <q-btn
                  flat
                  icon="add"
                  size="sm"
                  color="primary"
                  @click="tripCatch.fishTicketNumber.push('')"
                ></q-btn>
              </span>
            </div>

            <div v-for="(fishTicket, i) in tripCatch.fishTicketNumber" :key="i">
              <q-input
                v-model="tripCatch.fishTicketNumber[i]"
                dense
                autogrow
                outlined
                title="fish ticket number from the deleivery"
              >
                <q-btn flat dense icon="close" @click="tripCatch.fishTicketNumber.splice(i , 1)"></q-btn>
              </q-input>
            </div>
          </div>

          <q-field
            v-model="tripCatch.fishTicketDate"
            dense
            autogrow
            outlined
            label="Fish Ticket Date"
            title="Date the vessel returned to port for offload"
          >
            <q-popup-proxy ref="qDateProxy1" transition-show="scale" transition-hide="scale">
              <q-date
                v-model="tripCatch.fishTicketDate"
                @input="() => {fishTicketDate = '', $refs.qDateProxy1.hide()}"
              />
            </q-popup-proxy>
            <template v-slot:control>{{ formatDate(tripCatch.fishTicketDate) }}</template>
          </q-field>
        </div>
      </div>
    </q-expansion-item>

    <q-expansion-item
      expand-separator
      class="text-primary"
      icon="fa fa-layer-group"
      label="Hauls"
      default-opened
    >
      <div>
        <q-btn color="primary" @click="addHaul">Add Haul</q-btn>
        <br />
        <br />

        <q-table
          v-if="tripCatch.hauls && tripCatch.hauls.length > 0"
          :data="tripCatch.hauls"
          :columns="haulColumns"
          :pagination.sync="haulPagination"
          :selected.sync="haulSelected"
          row-key="haulNum"
          dense
          hide-bottom
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                :id="col.name"
              >{{ col.label }}</q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr
              :props="props"
              @click.native="{{ selectHaul(tripCatch.hauls.indexOf(props.row) + 1) }}"
            >
              <q-td
                headers="haulNum"
                key="haulNum"
                :props="props"
              >{{ tripCatch.hauls.indexOf(props.row) + 1 }}</q-td>
              <q-td
                headers="gearTypeCode"
                key="gearTypeCode"
                :props="props"
              >{{ props.row.gearTypeCode }}</q-td>
              <q-td
                headers="startDateTime"
                key="startDateTime"
                :props="props"
              >{{ formatDateTime(props.row.startDateTime) }}</q-td>
              <q-td headers="startDepth" key="startDepth" :props="props">{{ props.row.startDepth }}</q-td>
              <q-td
                headers="startLatitude"
                key="startLatitude"
                :props="props"
              >{{ props.row.startLatitude }}</q-td>
              <q-td
                headers="startLongitude"
                key="startLongitude"
                :props="props"
              >{{ props.row.startLongitude }}</q-td>
              <q-td
                headers="endDateTime"
                key="endDateTime"
                :props="props"
              >{{ formatDateTime(props.row.endDateTime) }}</q-td>
              <q-td headers="endDepth" key="endDepth" :props="props">{{ props.row.endDepth }}</q-td>
              <q-td
                headers="endLatitude"
                key="endLatitude"
                :props="props"
              >{{ props.row.endLatitude }}</q-td>
              <q-td
                headers="endLongitude"
                key="endLongitude"
                :props="props"
              >{{ props.row.endLongitude }}</q-td>
              <q-td
                headers="targetStrategy"
                key="targetStrategy"
                :props="props"
              >{{ props.row.targetStrategy }}</q-td>
              <q-td headers="comments" key="comments" :props="props">{{ props.row.comments }}</q-td>
            </q-tr>
          </template>
        </q-table>
        <br />

        <div
          v-if="selectedHaul"
          style="border: 2px solid #153547; border-radius: 5px; padding: 10px; margin-bottom: 10px"
        >
          <div class="row items-start">
            <div class="logbook-element">
              <div class="text-h4 text-secondary">Haul {{ selectedHaul }}</div>
              <q-select
                v-model="tripCatch.hauls[selectedHaul - 1].gearTypeCode"
                outlined
                label="Gear Type"
                dense
                autogrow
                title="1 : Groundfish trawl, footrope < 8 inches (small footrope), 2 : Groundfish trawl, footrope > 8 inches (large footrope), 3 : Midwater Trawl, 4 : Danish/Scottish Seine (trawl), 5 : Other Trawl Gear, 10 : Pot, 19 : hook & line, 20 : Longline (snap) (fixed gear)"
                :options="[
                        '1 : Groundfish trawl, footrope < 8 inches (small footrope)',
                        '2 : Groundfish trawl, footrope > 8 inches (large footrope)',
                        '3 : Midwater Trawl',
                        '4 : Danish/Scottish Seine (trawl)',
                        '5 : Other Trawl Gear',
                        '10 : Pot',
                        '19 : hook & line',
                        '20 : Longline (snap) (fixed gear)'
                        ]"
              ></q-select>
              <q-input
                v-if="['19 : hook & line', '10 : Pot'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].gearPerSet"
                dense
                autogrow
                outlined
                label="Gear Per Set"
                title="Total number of pots or hooks set (Mandatory for FG hauls)"
                mask="###"
              ></q-input>
              <q-input
                v-if="['19 : hook & line', '10 : Pot'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].gearLost"
                dense
                autogrow
                outlined
                label="Gear Lost"
                title="Number of pots or hooks lost (Mandatory for FG hauls)"
                mask="###"
              ></q-input>
              <q-input
                v-if="['19 : hook & line', '10 : Pot'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].avgHooksPerSeg"
                dense
                autogrow
                outlined
                label="Avg Hooks Per Set"
                title="Average hooks per set"
                mask="###"
              ></q-input>
              <q-input
                v-if="['1 : Groundfish trawl, footrope < 8 inches (small footrope)'  , '2 : Groundfish trawl, footrope > 8 inches (large footrope)'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].netType"
                dense
                autogrow
                outlined
                label="Net Type"
                title="1  = Groundfish trawl, footrope < 8 inches (small footrope)  , 2  = Groundfish trawl, footrope > 8 inches (large footrope)"
              ></q-input>
              <q-input
                v-if="['1 : Groundfish trawl, footrope < 8 inches (small footrope)'  , '2 : Groundfish trawl, footrope > 8 inches (large footrope)'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].codendCapacity"
                dense
                autogrow
                outlined
                label="Codend Capacity"
                title="Total estimated weight (lbs) the codened can hold"
                mask="#####"
              ></q-input>
              <q-input
                v-model="tripCatch.hauls[selectedHaul - 1].targetStrategy"
                dense
                autogrow
                outlined
                label="Target Strategy"
                title="Intended Target Species"
              ></q-input>
              <q-input
                v-model="tripCatch.hauls[selectedHaul - 1].comments"
                dense
                autogrow
                outlined
                label="Comments"
                title="Notes pertaining to a specific haul record"
              ></q-input>
            </div>

            <div class="logbook-element">
              <div class="text-h4 text-secondary">Start</div>
              <div class="row items-start">
                <q-field
                  v-model="tripCatch.hauls[selectedHaul - 1].startDateTime"
                  dense
                  autogrow
                  outlined
                  label="Date"
                  title="Date and time the gear was set"
                  style="width: 55%; margin-right: 5px"
                >
                  <q-popup-proxy ref="qDateProxy3" transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="tripCatch.hauls[selectedHaul - 1].startDateTime"
                      @input="() => {$refs.qDateProxy3.hide()}"
                    />
                  </q-popup-proxy>
                  <template
                    v-slot:control
                  >{{ formatDate(tripCatch.hauls[selectedHaul - 1].startDateTime) }}</template>
                </q-field>
                <q-input
                  v-model="haulStartTime"
                  dense
                  autogrow
                  outlined
                  label="Time"
                  title="Date and time the gear was set"
                  mask="##:##"
                  :rules="[val => val.split(':')[0] < 24 || 'invalid hour', val => val.split(':')[1] < 60 || 'invalid minute']"
                  style="width: 43.3%; padding-bottom: 0 !important"
                ></q-input>
              </div>
              <q-input
                v-model="tripCatch.hauls[selectedHaul - 1].startDepth"
                dense
                autogrow
                outlined
                label="Depth (ftm)"
                title="Depth of fishing gear when gear is deployed (Fathoms)"
                mask="#####"
              ></q-input>
              <div class="row items-start">
                <q-input
                  v-model="tripCatch.hauls[selectedHaul - 1].startLatitude"
                  dense
                  autogrow
                  outlined
                  label="Latitude"
                  title="Latitude of gear deployement in decimal degrees"
                  style="width: 50%; margin-right: 5px"
                  mask="N###.######"
                ></q-input>
                <q-input
                  v-model="tripCatch.hauls[selectedHaul - 1].startLongitude"
                  dense
                  autogrow
                  outlined
                  label="Longitude"
                  title="Longitude of gear deployement in decimal degrees"
                  style="width: 48.3%"
                  mask="N###.######"
                ></q-input>
              </div>
            </div>
            <div class="logbook-element">
              <div class="text-h4 text-secondary">End</div>
              <div class="row items-start">
                <q-field
                  v-model="tripCatch.hauls[selectedHaul - 1].endDateTime"
                  dense
                  autogrow
                  outlined
                  label="Date"
                  title="Date the gear was retrieved"
                  style="width: 55%; margin-right: 5px"
                >
                  <q-popup-proxy ref="qDateProxy4" transition-show="scale" transition-hide="scale">
                    <q-date
                      v-model="tripCatch.hauls[selectedHaul - 1].endDateTime"
                      @input="() => {$refs.qDateProxy4.hide()}"
                    />
                  </q-popup-proxy>
                  <template
                    v-slot:control
                  >{{ formatDate(tripCatch.hauls[selectedHaul - 1].endDateTime) }}</template>
                </q-field>
                <q-input
                  v-model="haulEndTime"
                  dense
                  autogrow
                  outlined
                  label="Time"
                  title="Time the gear was retrieved"
                  mask="##:##"
                  :rules="[val => val.split(':')[0] < 24 || 'invalid hour', val => val.split(':')[1] < 60 || 'invalid minute']"
                  style="width: 43.3%; padding-bottom: 0 !important"
                ></q-input>
              </div>
              <q-input
                v-model="tripCatch.hauls[selectedHaul - 1].endDepth"
                dense
                autogrow
                outlined
                label="Depth (ftm)"
                title="Depth of fishing gear when gear is retrieved (Fathoms)"
                mask="#####"
              ></q-input>
              <div class="row items-start">
                <q-input
                  v-model="tripCatch.hauls[selectedHaul - 1].endLatitude"
                  dense
                  autogrow
                  outlined
                  label="Latitude"
                  title="Latitude of gear retrieval in decimal degrees"
                  style="width: 50%; margin-right: 5px"
                  mask="N###.######"
                ></q-input>
                <q-input
                  v-model="tripCatch.hauls[selectedHaul - 1].endLongitude"
                  dense
                  autogrow
                  outlined
                  label="Longitude"
                  title="Longitude of gear retrieval in decimal degrees"
                  style="width: 48.3%"
                  mask="N###.######"
                ></q-input>
              </div>
            </div>
          </div>
          <q-expansion-item
            v-if="selectedHaul"
            expand-separator
            class="text-primary"
            icon="fa fa-fish"
            label="Catch"
            default-opened
          >
            <div>
              <q-btn color="primary" @click="addCatch">Add Catch</q-btn>
              <br />
              <br />
              <q-table
                v-if="selectedHaul && tripCatch.hauls[selectedHaul - 1].catch"
                :data="tripCatch.hauls[selectedHaul - 1].catch"
                :columns="catchColumns"
                :pagination.sync="catchPagination"
                :selected.sync="catchSelected"
                row-key="haulNum"
                dense
                hide-bottom
              >
                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    @click.native="{{ selectedCatch = tripCatch.hauls[selectedHaul - 1].catch.indexOf(props.row) + 1 }}"
                  >
                    <q-td key="action" :props="props">
                      <q-btn
                        round
                        size="xs"
                        color="red"
                        icon="clear"
                        @click.native="removeCatch(tripCatch.hauls[selectedHaul - 1].catch.indexOf(props.row))"
                      ></q-btn>
                    </q-td>
                    <q-td key="catchDisposition" :props="props">{{ props.row.catchDisposition }}</q-td>
                    <q-td key="speciesCode" :props="props">{{ props.row.speciesCode }}</q-td>
                    <q-td key="estimatedWeight" :props="props">{{ props.row.estimatedWeight }}</q-td>
                    <q-td key="catchCount" :props="props">{{ props.row.catchCount }}</q-td>
                    <q-td key="calcWeightType" :props="props">{{ props.row.calcWeightType }}</q-td>
                    <q-td key="length" :props="props">{{ props.row.length }}</q-td>
                    <q-td key="timeOnDeck" :props="props">{{ props.row.timeOnDeck }}</q-td>
                    <q-td key="comments" :props="props">{{ props.row.comments }}</q-td>
                  </q-tr>
                </template>
              </q-table>
              <br />
              <div
                v-if="selectedCatch"
                style="border: 2px solid #153547; border-radius: 5px; padding: 10px;"
              >
                <div class="text-h4 text-secondary">
                  <span
                    v-if="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode"
                  >{{ tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode }} -</span>
                  {{ tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].catchDisposition }}
                </div>
                <div class="row items-start">
                  <q-select
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].catchDisposition"
                    dense
                    autogrow
                    outlined
                    label="Catch Disposition"
                    title="Disposition of the Catch (Retained or Discard)"
                    :options="['Discarded', 'Retained']"
                  ></q-select>
                  <q-select
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode"
                    dense
                    autogrow
                    outlined
                    label="Species Code"
                    title="WCGOP species code (3 or 4 digits)"
                    :option-label="opt => opt.commonName +  ' ('  + opt.speciesCode + ')'"
                    :option-value="opt => opt.speciesCode"
                    :options="speciesCodeSelectOptions"
                    use-input
                    @filter="speciesFilterFn"
                    emit-value
                    :display-value="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode"
                  >
                    <template v-slot:append>
                      <q-btn
                        v-if="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode"
                        round
                        size="xs"
                        color="secondary"
                        icon="clear"
                        @click="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode = null"
                      ></q-btn>
                    </template>
                  </q-select>
                  <q-input
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].estimatedWeight"
                    dense
                    autogrow
                    outlined
                    label="Estimated Total Weight"
                    title="Estimated weight in lbs"
                    mask="#####"
                  ></q-input>
                  <q-input
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].catchCount"
                    dense
                    autogrow
                    outlined
                    label="Count"
                    title="Number of fish for a species (Yellow Eye RF, PHLB, Species of concern...Salmon, Green Sturgeon, Eulachon). Not required for all species"
                    mask="###"
                  ></q-input>
                  <q-select
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].calcWeightType"
                    dense
                    autogrow
                    outlined
                    label="Weight Calculation Method"
                    title="Description of how the catch was calculated"
                    :options="['Estimated Weight', 'From Length', 'From Average Weight', 'Calculated Field']"
                  ></q-select>
                  <q-input
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].length"
                    dense
                    autogrow
                    outlined
                    label="Length"
                    title="Length (in cm) of individual fish (Pacific Halibut)"
                    mask="####"
                  ></q-input>
                  <q-input
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].timeOnDeck"
                    dense
                    autogrow
                    outlined
                    label="Time On Deck"
                    title="Time on deck (in min) specific to each Pacific Halibut"
                    mask="###"
                  ></q-input>
                  <q-input
                    class="logbook-element"
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].comments"
                    dense
                    autogrow
                    outlined
                    label="Comments"
                    title="Notes pertaining to a specific catch record"
                  ></q-input>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
      </div>
    </q-expansion-item>
    <div style="float: right; margin-bottom: 20px">
      <q-btn @click="submitLogbook" color="primary">Submit / Update</q-btn>

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
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { WatchOptions } from 'vue';

import { Notify } from 'quasar';
import moment from 'moment';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

import { getTripsApiTrip, getCatchApiCatch, newApiCatch, updateApiCatch } from '@boatnet/bn-common';
import { authService } from '@boatnet/bn-auth/lib';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const selectedHaul: any = ref(null);
    const selectedCatch: any = ref(null);

    const tripCatch: any = reactive({});

    const getClass = (attribute: any, option: string) => {
      if (option === 'yes') {
        if (tripCatch[attribute]) {
          return 'bg-primary text-white';
        } else {
          return 'text-primary';
        }
      } else {
        if (!tripCatch[attribute]) {
          return 'bg-secondary text-white';
        } else {
          return 'text-primary';
        }
      }
    };

    const addCatch = () => {
      if (!tripCatch.hauls[selectedHaul.value - 1].catch) {
        Vue.set(tripCatch.hauls[selectedHaul.value - 1], 'catch', []);
      }
      tripCatch.hauls[selectedHaul.value - 1].catch.push({});
      selectedCatch.value =
        tripCatch.hauls[selectedHaul.value - 1].catch.length;
    };

    const addHaul = () => {
      tripCatch.hauls.push({
        startDateTime: '',
        endDateTime: ''
      });
      selectedCatch.value = null;
      selectedHaul.value = tripCatch.hauls.length;
      haulStartTime.value = '';
      haulEndTime.value = '';
    };

    const selectHaul = (haulIndex: number) => {
      selectedHaul.value = haulIndex;
      selectedCatch.value = null;
    };

    const haulPagination = {
      sortBy: 'departureDate',
      descending: false,
      rowsPerPage: 0
    };

    const haulSelected: any = [];

    const haulColumns = [
      {
        name: 'haulNum',
        label: 'Haul',
        field: 'haulNum',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'gearTypeCode',
        label: 'Gear Type',
        field: 'gearTypeCode',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'startDateTime',
        label: 'Start Date / Time',
        field: 'startDateTime',
        required: false,
        align: 'left',
        sortable: true,
        sort: (a: any, b: any) => a.localeCompare(b)
      },
      {
        name: 'startDepth',
        label: 'Start Depth',
        field: 'startDepth',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'startLatitude',
        label: 'Start Latitude',
        field: 'startLatitude',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'startLongitude',
        label: 'Start Longitude',
        field: 'startLongitude',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'endDateTime',
        label: 'End Date / Time',
        field: 'endDateTime',
        required: false,
        align: 'left',
        sortable: true,
        sort: (a: any, b: any) => a.localeCompare(b)
      },
      {
        name: 'endDepth',
        label: 'End Depth',
        field: 'endDepth',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'endLatitude',
        label: 'End Latitude',
        field: 'endLatitude',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'endLongitude',
        label: 'End Longitude',
        field: 'endLongitude',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'targetStrategy',
        label: 'Target Strategy',
        field: 'targetStrategy',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'comments',
        label: 'Comments',
        field: 'comments',
        required: false,
        align: 'right',
        sortable: true
      }
    ];

    const catchPagination = {
      sortBy: 'departureDate',
      descending: false,
      rowsPerPage: 0
    };

    const catchSelected: any = [];

    const catchColumns = [
      {
        name: 'action',
        label: '',
        field: 'action',
        required: false,
        align: 'left',
        sortable: false
      },
      {
        name: 'catchDisposition',
        label: 'Disposition',
        field: 'catchDisposition',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'speciesCode',
        label: 'Species Code',
        field: 'speciesCode',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'estimatedWeight',
        label: 'Estimated Weight',
        field: 'estimatedWeight',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'catchCount',
        label: 'Count',
        field: 'catchCount',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'calcWeightType',
        label: 'Weight Calc Method',
        field: 'calcWeightType',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'length',
        label: 'Length',
        field: 'length',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'timeOnDeck',
        label: 'Time On Deck',
        field: 'timeOnDeck',
        required: false,
        align: 'left',
        sortable: true
      },
      {
        name: 'comments',
        label: 'Comments',
        field: 'comments',
        required: false,
        align: 'right',
        sortable: true
      }
    ];

    const removeCatch = (catchIndex: number) => {
      tripCatch.hauls[selectedHaul.value - 1].catch.splice(catchIndex, 1);
    };

    const fisheryOptions: any = [];
    const getFisheryOptions = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: 'fishery'
      };

      const fisheries = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      const fisheryOptionsRows = fisheries.rows.map(
        (row: any) => row.doc.description
      );
      for (const row of fisheryOptionsRows) {
        fisheryOptions.push(row);
      }

      fisheryOptions.sort((a: any, b: any) => {
        if (a > b) {
          return 1;
        } else if (a < b) {
          return -1;
        } else {
          return 0;
        }
      });
    };

    const gearTypeOptions: any = [];
    const getGearTypeOptions = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: 'gear-type'
      };

      const gearTypes = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      const gearTypeOptionsRows = gearTypes.rows.map(
        (row: any) => row.doc.description
      );
      for (const row of gearTypeOptionsRows) {
        gearTypeOptions.push(row);
      }

      gearTypeOptions.sort((a: any, b: any) => {
        if (a > b) {
          return 1;
        } else if (a < b) {
          return -1;
        } else {
          return 0;
        }
      });
    };

    const speciesCodeOptions: any = [];
    const getSpeciesCodeOptions = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: 'ifq-species-codes'
      };

      const speciesCodes = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      const codes = speciesCodes.rows[0].doc.codes;
      for (const row of codes) {
        const value = {
          speciesCode: row.speciesCode,
          commonName: row.commonName
        };
        if (
          speciesCodeOptions
            .map((species: any) => species.commonName)
            .indexOf(row.commonName) === -1
        ) {
          speciesCodeOptions.push(value);
        }
      }
      speciesCodeOptions.sort((a: any, b: any) => {
        if (a.commonName > b.commonName) {
          return 1;
        } else if (a.commonName < b.commonName) {
          return -1;
        } else {
          return 0;
        }
      });
    };

    const validPacfinCodes: any = [];
    const getValidPacfinCodes = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: 'ifq-species-codes'
      };

      const speciesCodes = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      const codes = speciesCodes.rows[0].doc.codes;

      for (const row of codes) {
        validPacfinCodes.push(row.speciesCode);
      }
    };

    const getTaxonomyAliases = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        include_docs: true
      };

      const taxonomyAliases = await masterDb.view(
        'Taxonomy',
        'pacfin-code-for-wcgop-alias',
        queryOptions
      );

      for (const row of taxonomyAliases.rows) {
        if (validPacfinCodes.includes(row.doc.taxonomy.pacfinSpeciesCode)) {
          for (const name of row.doc.commonNames) {
            const value = {
              speciesCode: row.doc.taxonomy.pacfinSpeciesCode,
              commonName: name
            };
            if (
              speciesCodeOptions
                .map((species: any) => species.commonName)
                .indexOf(row.commonName) === -1
            ) {
              speciesCodeOptions.push(value);
            }
          }
        }
      }
      speciesCodeOptions.sort((a: any, b: any) => {
        if (a.commonName > b.commonName) {
          return 1;
        } else if (a.commonName < b.commonName) {
          return -1;
        } else {
          return 0;
        }
      });
    };

    const speciesCodeSelectOptions: any = ref([]);
    const speciesFilterFn = (val: string, update: any, abort: any) => {
      if (val === '') {
        update(() => {
          speciesCodeSelectOptions.value = speciesCodeOptions;
        });
        return;
      }
      update(() => {
        speciesCodeSelectOptions.value = speciesCodeOptions.filter(
          (option: any) => {
            return (
              option.commonName.toLowerCase().includes(val.toLowerCase()) ||
              option.speciesCode.toLowerCase().includes(val.toLowerCase())
            );
          }
        );
      });
    };

    let ports: any = [];
    const getPorts = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        start_key: '',
        inclusive_end: true,
        descending: false,
        include_docs: true
      };

      ports = await masterDb.view('obs_web', 'all_port_names', queryOptions);
      ports = ports.rows.map((row: any) => row.doc);
    };

    const getPortDecoderPorts = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: 'a-port-decoder'
      };

      const portDecoder = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      ports = portDecoder.rows[0].doc.ports;

      ports.sort((a: any, b: any) => {
        if (a.NAME > b.NAME) {
          return 1;
        } else if (a.NAME < b.NAME) {
          return -1;
        } else {
          return 0;
        }
      });
    };

    const portOptions: any = ref([]);
    const departurePortFilterFn = (val: string, update: any, abort: any) => {

        update(() => {
          if (tripCatch.departureState && tripCatch.departureState === 'CA') {
            portOptions.value = ports.filter((port: any) => port.AGID === 'C');
          } else if (tripCatch.departureState && tripCatch.departureState === 'OR') {
            portOptions.value = ports.filter((port: any) => port.AGID === 'O');
          } else if (tripCatch.departureState && tripCatch.departureState === 'WA' ) {
            portOptions.value = ports.filter((port: any) => port.AGID === 'W');
          } else {
            portOptions.value = ports;
          }

          if (val !== '') {
            portOptions.value = portOptions.value.filter((port: any) => {
              return (
                port.NAME.includes(val.toUpperCase()) ||
                port.PCID.includes(val.toUpperCase())
              );
            });
          }
        });
        return;
    };

    const returnPortFilterFn = (val: string, update: any, abort: any) => {

        update(() => {
          if (tripCatch.returnState && tripCatch.returnState === 'CA') {
            portOptions.value = ports.filter((port: any) => port.AGID === 'C');
          } else if (tripCatch.returnState && tripCatch.returnState === 'OR') {
            portOptions.value = ports.filter((port: any) => port.AGID === 'O');
          } else if (tripCatch.returnState && tripCatch.returnState === 'WA') {
            portOptions.value = ports.filter((port: any) => port.AGID === 'W');
          } else {
            portOptions.value = ports;
          }

          if (val !== '') {
            portOptions.value = portOptions.value.filter((port: any) => {
              return (
                port.NAME.includes(val.toUpperCase()) ||
                port.PCID.includes(val.toUpperCase())
              );
            });
          }
        });
        return;
    };

    const getCatch = async (id: any) => {
      await getCatchApiCatch(id).then( async (res: any) => {
        if (res !== 'not found' && res.filter( (row: any) => row.source === 'logbook').length > 0) {
          for (const row of res) {
            if (row.source === 'logbook') {
              for (const key of Object.keys(row)) {
                Vue.set(tripCatch, key, row[key]);
              }
            }
          }
        } else {
          await getTripsApiTrip(id).then((res: any) => {
            if (res === 'Doc with specified tripNum not found') {
              Notify.create({
                message: '<b>Invalid trip number, can not continue</b>',
                    position: 'center',
                    color: 'primary',
                    timeout: 2000,
                    icon: 'warning',
                    html: true,
                    multiLine: true
                });
              return;
            } else {
              console.log(res)
              const apiTrip: any = {
                tripNum: res.tripNum,
                year: moment(res.departureDate).format('YYYY'),

                isEFPTrip: false,
                isObserved: res.isSelected ? res.isSelected : false,
                isSigned: true,
                isVoid: false,
                buyers: [],
                fishTicketNumber: [],
                hauls: [],

                vesselName: res.vesselName,
                vesselNumber: res.vesselId,
                departureDateTime: res.departureDate,
                departurePortCode: getPortCode(res.departurePort),
                departureState: getPortState(res.departurePort),
                returnDateTime: res.returnDate,
                returnPortCode: getPortCode(res.returnPort),
                returnState: getPortState(res.returnPort),
                fishery: res.fishery ? res.fishery : '',
                createdBy: authService.getCurrentUser()!.username,
                createdDate: moment().format(),
                source: 'logbook'
              };

              for (const key of Object.keys(apiTrip)) {
                Vue.set(tripCatch, key, apiTrip[key]);
              }
            }
          })
        }
      });
    };

    const getPort = (portCodeOrName: string) => {
      if (typeof portCodeOrName !== 'string') {
        return null;
      }
      const port = ports.find( (port: any) => port.PCID.toLowerCase().includes(portCodeOrName.toLowerCase())
                                              ||
                                              port.NAME.toLowerCase().includes(portCodeOrName.toLowerCase())
                                              );
      if (port) {
        return port;
      } else {
        return null;
      }
    }

    const getPortCode = (portCode: string) => {
      const port = getPort(portCode);
      if (port) {
        return port.PCID;
      } else {
        return '';
      }
    }

    const getPortState = (portCode: string) => {
      const port = getPort(portCode);
      if (port) {
        switch (port.AGID) {
          case 'W':
            return 'WA';
            break;
          case 'C':
            return 'CA';
            break;
          case 'O':
            return 'OR';
            break;
        }
      } else {
        return '';
      }

    }

    const submitLogbook = () => {
      tripCatch.updatedBy = authService.getCurrentUser()!.username;
      tripCatch.updatedDate = moment().format();
      console.log(tripCatch);
      if (tripCatch._id && tripCatch._rev) {
        console.log('Updating API Catch record');
        updateApiCatch(tripCatch).then( (res) => {
          console.log(res);
          Notify.create({
            message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase">Logbook Data Successfully Updated</div>',
                position: 'top',
                color: 'green',
                timeout: 3000,
                icon: 'warning',
                html: true,
                multiLine: true
            });
          context.root.$router.back();
        })
      } else {
        console.log('Submitting new API Catch record');
        newApiCatch(tripCatch).then( (res) => {
          console.log(res);
          Notify.create({
            message: '<div class="text-h4" style="height: 100%: text-align: center; text-transform: uppercase">Logbook Data Successfully Submitted</div>',
                position: 'top',
                color: 'green',
                timeout: 3000,
                icon: 'warning',
                html: true,
                multiLine: true
            });
          context.root.$router.back();
        })
      }
    }

    const formatDateTime = (val: any) => {
      if (val) {
        return moment(val).format('MMM, DD, YYYY HH:mm');
      }
    };

    const formatDate = (val: any) => {
      if (val) {
        return moment(val).format('MMM, DD, YYYY');
      }
    };

    const watcherOptions: WatchOptions = {
      immediate: false
    };

    const departureTime: any = ref('');
    const getDepartureTime = () => {
      if (tripCatch.departureDateTime) {
        departureTime.value = moment(tripCatch.departureDateTime).format(
          'hh:mm'
        );
      }
    };
    watch(
      () => departureTime.value,
      (newVal, oldVal) => {
        const departureDate = moment(tripCatch.departureDateTime);
        if (newVal && newVal.indexOf(':') !== -1) {
          departureDate.set('hour', newVal.split(':')[0]);
          departureDate.set('minute', newVal.split(':')[1]);
          tripCatch.departureDateTime = departureDate.format();
        }
      },
      watcherOptions
    );

    const returnTime: any = ref('');
    const getReturnTime = () => {
      if (tripCatch.returnDateTime) {
        returnTime.value = moment(tripCatch.returnDateTime).format('hh:mm');
      }
    };
    watch(
      () => returnTime.value,
      (newVal, oldVal) => {
        const returnDate = moment(tripCatch.returnDateTime);
        if (newVal && newVal.indexOf(':') !== -1) {
          returnDate.set('hour', newVal.split(':')[0]);
          returnDate.set('minute', newVal.split(':')[1]);
          tripCatch.returnDateTime = returnDate.format();
        }
      },
      watcherOptions
    );

    const haulStartTime: any = ref([]);
    watch(
      () => haulStartTime.value,
      (newVal, oldVal) => {
        if (newVal && newVal.indexOf(':') !== -1) {
          const startDate = moment(
            tripCatch.hauls[selectedHaul.value - 1].startDateTime
          );
          startDate.set('hour', newVal.split(':')[0]);
          startDate.set('minute', newVal.split(':')[1]);
          tripCatch.hauls[
            selectedHaul.value - 1
          ].startDateTime = startDate.format();
        }
      },
      watcherOptions
    );

    const haulEndTime: any = ref([]);
    watch(
      () => haulEndTime.value,
      (newVal, oldVal) => {
        if (newVal && newVal.indexOf(':') !== -1) {
          const endDate = moment(
            tripCatch.hauls[selectedHaul.value - 1].endDateTime
          );
          endDate.set('hour', newVal.split(':')[0]);
          endDate.set('minute', newVal.split(':')[1]);
          tripCatch.hauls[
            selectedHaul.value - 1
          ].endDateTime = endDate.format();
        }
      },
      watcherOptions
    );

    onMounted(() => {
      getValidPacfinCodes();
      getTaxonomyAliases();
      // getSpeciesCodeOptions();
      getFisheryOptions();
      getGearTypeOptions();
      getPortDecoderPorts();
      // getPorts();
      if (context.root.$route.params.id === 'new') {
        const dummyTrip: any = {
          tripNum: '00000',
          year: moment().format('YYYY'),
          isEFPTrip: false,
          isObserved: false,
          isSigned: true,
          isVoid: false,
          buyers: [],
          fishTicketNumber: [],
          hauls: [],
          source: 'logbook',
          createdBy: authService.getCurrentUser()!.username,
          createdDate: moment().format(),

          vesselName: state.vessel.activeVessel.vesselName,
          vesselNumber: state.vessel.activeVessel.coastGuardNumber
            ? state.vessel.activeVessel.coastGuardNumber
            : state.vessel.activeVessel.stateRegulationNumber
        };

        for (const key of Object.keys(dummyTrip)) {
          Vue.set(tripCatch, key, dummyTrip[key]);
        }
        setTimeout(() => {
          getDepartureTime();
          getReturnTime();
        }, 500);
      } else {
        getCatch(context.root.$route.params.id).then(() => {
          getDepartureTime();
          getReturnTime();
        });
      }
    });

    return {
      tripCatch,
      addCatch,
      addHaul,
      selectHaul,
      getClass,
      selectedHaul,
      selectedCatch,
      fisheryOptions,
      gearTypeOptions,
      formatDateTime,
      formatDate,
      departureTime,
      returnTime,
      haulStartTime,
      haulEndTime,
      haulPagination,
      haulSelected,
      haulColumns,
      catchPagination,
      catchSelected,
      catchColumns,
      removeCatch,
      speciesCodeOptions,
      speciesCodeSelectOptions,
      speciesFilterFn,
      portOptions,
      departurePortFilterFn,
      returnPortFilterFn,
      submitLogbook
    };
  }
});
</script>

<style>
/* body .p-inputtext {
    border-radius: 4px !important;
    background-color: #c8c8c8 !important;
} */

.logbook-element {
  width: 100%;
  max-width: 350px;
  margin: 0 5px;
}
</style>
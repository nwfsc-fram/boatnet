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
        {{ tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].speciesCode }} -
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
        <div class="row items-start logbook-element no-wrap">

          <!-- <q-input
            v-model="tripCatch.departureDateTime"
            label="Departure Date"
            title="Date/Time the vessel departed port"
            dense
            autogrow
            outlined
            style="width: 46%; margin-right: 5px"

            >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date v-model="tripCatch.departureDateTime" @input="() => $refs.qDateProxy.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input> -->
        <!-- <span class="p-float-label"> -->
          <pCalendar
            id="departdate"
            v-model="depDateTime"
            :touchUI="isMobile"
            :inline="false"
            selectionMode="single"
            :selectOtherMonths="true"
            title="Date the vessel departed port"
            :showTime="true"
            onfocus="blur()"
            >
          </pCalendar>
          <label for="departdate" class="calendar-label">Departure Date/Time</label>

        <!-- </span> -->

        <!-- <span class="p-float-label">
          <pInput
            v-model="departureTime"
            id="departtime"
            title="Time the vessel departed port"
          >
          </pInput>
          <label for="departtime" style="color: #007EC6">Departure time</label>
        </span>

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
            style="padding-bottom: 0 !important"
          ></q-input> -->
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
        <div class="row items-start logbook-element no-wrap">

        <!-- <span class="p-float-label"> -->
          <pCalendar
            id="returndate"
            v-model="retDateTime"
            :inline="false"
            :touchUI="isMobile"
            selectionMode="single"
            :selectOtherMonths="true"
            title="Date the vessel returned to port"
            :showTime="true"
            onfocus="blur()"
            >
          </pCalendar>
          <label for="returndate" class="calendar-label">Return Date/Time</label>
        <!-- </span> -->

          <!-- <q-input
            v-model="tripCatch.returnDateTime"
            label="Return Date"
            title="Date the vessel returned to port for offload"
            dense
            autogrow
            outlined
            style="width: 46%; margin-right: 5px"

            >
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date v-model="tripCatch.returnDateTime" @input="() => $refs.qDateProxy.hide()" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

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
          ></q-input> -->
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

            <div v-for="(buyer, i) in tripCatch.buyers" :key="i" class="list-item">
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
          <q-select
            v-model="tripCatch.skipperName"
            :options="skipperOptions"
            dense
            autogrow
            outlined
            label="Skipper"
            use-input
            new-value-mode="add-unique"
            title="Name of the vessel captain"
          ></q-select>
        </div>
      </div>
      <div class="row items-start">
        <div class="logbook-element">
          <q-input
            v-model="tripCatch.logbookPageNumber"
            dense
            autogrow
            outlined
            label="Logbook Page #(s)"
            title="Page number from vessel logbook"
          ></q-input>

          <q-input
            class="list-item"
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
                  @click="addFishTicket"
                ></q-btn>
              </span>
            </div>

            <div v-for="(fishTicket, i) in tripCatch.fishTickets" :key="i" class="list-item">
              <div class="row items-start logbook-element">
              <q-input
                v-model="tripCatch.fishTickets[i].fishTicketNumber"
                dense
                autogrow
                outlined
                label="Number"
                title="fish ticket number from the deleivery"
                style="width: 46%; margin-right: 5px"
              >
              <template v-slot:append>
                <q-btn flat dense icon="close" @click="tripCatch.fishTickets.splice(i , 1)"></q-btn>
              </template>
              </q-input>

              <pCalendar
                :id="'ftdate' + i"
                v-model="fishTicketDates[i]"
                :touchUI="isMobile"
                :inline="false"
                selectionMode="single"
                :selectOtherMonths="true"
                title="Date the vessel returned to port for offload"
                :showTime="false"
                onfocus="blur()"
                class="fish-ticket-calendar"
                >
              </pCalendar>
              <label :for="'ftdate' + i" class="fishticket-calendar-label">Date</label>
              </div>
            </div>
          </div>


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
          selection="single"
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
              @click.native="{{ selectHaul(tripCatch.hauls.indexOf(props.row) + 1); haulSelected = [...props.row] }}"
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
              >{{ gearTypeOptions.map( (row) => row.lookupVal ).includes(props.row.gearTypeCode) ? gearTypeOptions.find( (row) => row.lookupVal === props.row.gearTypeCode).description : props.row.gearTypeCode }}</q-td>
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
                title="Groundfish trawl, footrope < 8 inches (small footrope), Groundfish trawl, footrope > 8 inches (large footrope), Midwater Trawl, Danish/Scottish Seine (trawl), Other Trawl Gear, Pot, hook & line, Longline (snap) (fixed gear)"
                :options=gearTypeOptions
                :option-label="opt => opt.description"
                :option-value="opt => opt.lookupVal"
                emit-value
                :display-value="getGearTypeDescription"
                class="logbook-element"
              ></q-select>
              <q-input
                v-if="['19', '10'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].gearPerSet"
                dense
                autogrow
                outlined
                label="Gear Per Set"
                title="Total number of pots or hooks set (Mandatory for FG hauls)"
                mask="###"
                class="logbook-element"
              ></q-input>
              <q-input
                v-if="['19', '10'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].gearLost"
                dense
                autogrow
                outlined
                label="Gear Lost"
                title="Number of pots or hooks lost (Mandatory for FG hauls)"
                mask="###"
                class="logbook-element"
              ></q-input>
              <q-input
                v-if="['19', '10'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].avgHooksPerSeg"
                dense
                autogrow
                outlined
                label="Avg Hooks Per Set"
                title="Average hooks per set"
                mask="###"
                class="logbook-element"
              ></q-input>
              <q-input
                v-if="['1', '2'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].netType"
                dense
                autogrow
                outlined
                label="Net Type"
                title="1  = Groundfish trawl, footrope < 8 inches (small footrope)  , 2  = Groundfish trawl, footrope > 8 inches (large footrope)"
                class="logbook-element"
              ></q-input>
              <q-input
                v-if="['1' , '2'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
                v-model="tripCatch.hauls[selectedHaul - 1].codendCapacity"
                dense
                autogrow
                outlined
                label="Codend Capacity"
                title="Total estimated weight (lbs) the codened can hold"
                mask="#####"
                class="logbook-element"
              ></q-input>
              <div class="logbook-element" v-if="['1', '2'].includes(tripCatch.hauls[selectedHaul - 1].gearTypeCode)"
              >
                <q-field
                  v-model="tripCatch.hauls[selectedHaul - 1].isCodendLost"
                  class="text-primary"
                  outlined
                  dense
                  autogrow
                  title="Indicates Lost Codend"
                >
                  <template v-slot:control>
                    <span>Is Lost Codend?</span>&nbsp;
                    <q-btn
                      :class="getHaulClass('isCodendLost', 'yes')"
                      size="sm"
                      label="Yes"
                      @click="tripCatch.hauls[selectedHaul - 1].isCodendLost = true"
                    ></q-btn>&nbsp;
                    <q-btn
                      :class="getHaulClass('isCodendLost', 'no')"
                      size="sm"
                      label="No"
                      @click="tripCatch.hauls[selectedHaul - 1].isCodendLost = false"
                    ></q-btn>
                  </template>
                </q-field>
              </div>
              <q-select
                v-model="tripCatch.hauls[selectedHaul - 1].targetStrategy"
                dense
                autogrow
                outlined
                label="Target Strategy"
                title="WCGOP species code (3 or 4 digits)"
                :option-label="opt => opt.commonName +  ' ('  + opt.speciesCode + ')'"
                :option-value="opt => opt.speciesCode"
                :options="speciesCodeSelectOptions"
                use-input
                @filter="speciesFilterFn"
                emit-value
                :display-value="tripCatch.hauls[selectedHaul - 1].targetStrategy"
                class="logbook-element"
              >
                <template v-slot:append>
                  <q-btn
                    v-if="tripCatch.hauls[selectedHaul - 1].targetStrategy"
                    round
                    size="xs"
                    color="secondary"
                    icon="clear"
                    @click="tripCatch.hauls[selectedHaul - 1].targetStrategy = null"
                  ></q-btn>
                </template>
              </q-select>
              <q-input
                v-model="tripCatch.hauls[selectedHaul - 1].comments"
                dense
                autogrow
                outlined
                label="Comments"
                title="Notes pertaining to a specific haul record"
                class="logbook-element"
              ></q-input>
            </div>

            <div class="logbook-element">
              <div class="text-h4 text-secondary">Start</div>
              <div class="row items-start calendar-logbook-element no-wrap">

              <pCalendar
                id="haulstartdate"
                v-model="haulStartDateTime"
                :touchUI="isMobile"
                :inline="false"
                selectionMode="single"
                :selectOtherMonths="true"
                title="Date the vessel departed port"
                :showTime="true"
                onfocus="blur()"
                >
              </pCalendar>
              <label for="haulstartdate" class="calendar-label">Haul Start Date/Time</label>

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
              <div class="row items-start text-black text-bold">
                <div style="width: 51.5%">Latitude</div>
                <div>Longitude</div>
              </div>
              <div class="row items-start">
                <q-input
                  v-model="coordinates.start.lat.deg"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="DEG"
                  title="latitude degrees"
                  style="width: 20%; margin-right: 5px; margin-bottom: 5px"
                ></q-input>
               <q-input
                  v-model="coordinates.start.lat.min"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="MIN"
                  :rules="[val => val < 60 || 'MIN val must be less than 60' ]"
                  title="latitude minutes"
                  style="width: 27%; margin-right: 10px"
                ></q-input>
                <q-input
                  v-model="coordinates.start.long.deg"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="DEG"
                  title="longitude degrees"
                  style="width: 20%; margin-right: 5px; margin-bottom: 5px"
                ></q-input>
                <q-input
                  v-model="coordinates.start.long.min"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="MIN"
                  :rules="[val => val < 60 || 'MIN val must be less than 60' ]"
                  title="longitude minutes"
                  style="width: 27%; margin-bottom: 5px"
                ></q-input>
              </div>
              <div class="row items-start">
                <q-input
                  v-model="coordinates.start.lat.dd"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="Decimal Degrees"
                  title="Latitude of gear set in decimal degrees"
                  style="width: 48.5%; margin-right: 10px; margin-bottom: 5px"
                ></q-input>
                <q-input
                  v-model="coordinates.start.long.dd"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="Decimal Degrees"
                  title="Longitude of gear set in decimal degrees"
                  :rules="[ val => val >= 0 || 'enter positive degrees - value auto-converted to negative']"
                  style="width: 48.5%"
                ></q-input>
              </div>
            </div>
            <div class="logbook-element">
              <div class="text-h4 text-secondary">End</div>
              <div class="row items-start calendar-logbook-element no-wrap">
                <pCalendar
                  id="haulenddate"
                  v-model="haulEndDateTime"
                  :touchUI="isMobile"
                  :inline="false"
                  selectionMode="single"
                  :selectOtherMonths="true"
                  title="Date the vessel departed port"
                  :showTime="true"
                  onfocus="blur()"
                  >
                </pCalendar>
                <label for="haulenddate" class="calendar-label">Haul End Date/Time</label>
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
              <div class="row items-start text-black text-bold">
                <div style="width: 51.5%">Latitude</div>
                <div>Longitude</div>
              </div>
              <div class="row items-start">
                <q-input
                  v-model="coordinates.end.lat.deg"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="DEG"
                  title="latitude degrees"
                  style="width: 20%; margin-right: 5px; margin-bottom: 5px"
                ></q-input>
               <q-input
                  v-model="coordinates.end.lat.min"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="MIN"
                  :rules="[val => val < 60 || 'MIN val must be less than 60' ]"
                  title="latitude minutes"
                  style="width: 27%; margin-right: 10px; margin-bottom: 5px"
                ></q-input>
                <q-input
                  v-model="coordinates.end.long.deg"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="DEG"
                  title="longitude degrees"
                  style="width: 20%; margin-right: 5px; margin-bottom: 5px"
                ></q-input>
                <q-input
                  v-model="coordinates.end.long.min"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="MIN"
                  :rules="[val => val < 60 || 'MIN val must be less than 60' ]"
                  title="longitude minutes"
                  style="width: 27%; margin-bottom: 5px"
                ></q-input>
              </div>
              <div class="row items-start">
                <q-input
                  v-model="coordinates.end.lat.dd"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="Decimal Degrees"
                  title="Latitude of gear set in decimal degrees"
                  style="width: 48.5%; margin-right: 10px"
                ></q-input>
                <q-input
                  v-model="coordinates.end.long.dd"
                  dense
                  autogrow
                  outlined
                  debounce="500"
                  label="Decimal Degrees"
                  title="Longitude of gear set in decimal degrees"
                  :rules="[ val => val >= 0 || 'enter positive degrees - value auto-converted to negative']"
                  style="width: 48.5%"
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
                row-key="index"
                dense
                hide-bottom
              >
                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    @click.native="{{ selectedCatch = tripCatch.hauls[selectedHaul - 1].catch.indexOf(props.row) + 1; catchSelected = [...props.row] }}"
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
                    <q-td key="weight" :props="props">{{ props.row.weight }}</q-td>
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
                    v-model="tripCatch.hauls[selectedHaul - 1].catch[selectedCatch - 1].weight"
                    dense
                    autogrow
                    outlined
                    label="Weight"
                    title="Estimated weight in lbs"
                    mask="######"
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

import InputText from 'primevue/inputtext';
Vue.component('pInput', InputText);

import { getTripsApiTrip, getCatchApiCatch, newApiCatch, updateApiCatch } from '@boatnet/bn-common';
import { authService } from '@boatnet/bn-auth/lib';

import _ from 'lodash';

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

    const getHaulClass = (attribute: any, option: string) => {
      if (option === 'yes') {
        if (tripCatch.hauls[selectedHaul.value - 1][attribute]) {
          return 'bg-primary text-white';
        } else {
          return 'text-primary';
        }
      } else {
        if (!tripCatch.hauls[selectedHaul.value - 1][attribute]) {
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
      selectedCatch.value = tripCatch.hauls[selectedHaul.value - 1].catch.length;
      indexCatch();
      catchSelected.value = [_.cloneDeep(tripCatch.hauls[selectedHaul.value - 1].catch[tripCatch.hauls[selectedHaul.value - 1].catch.length - 1])];
    };

    const addHaul = () => {
      tripCatch.hauls.push({
        startDateTime: _.cloneDeep(tripCatch.departureDateTime),
        endDateTime: _.cloneDeep(tripCatch.returnDateTime),
        haulNum: tripCatch.hauls.length + 1,
        isCodendLost: null
      });
      selectedCatch.value = null;
      selectedHaul.value = tripCatch.hauls.length;
      // haulStartTime.value = tripCatch.departureDateTime;
      haulEndTime.value = tripCatch.returnDateTime;

      haulSelected.value = [_.cloneDeep(tripCatch.hauls[tripCatch.hauls.length - 1])];

      coordinates.value = {
        start: {
          lat: { deg: '', min: '', dd: '' },
          long: { deg: '', min: '', dd: '' }
        },
        end: {
          lat: { deg: '', min: '', dd: '' },
          long: { deg: '', min: '', dd: '' }
        }
      };
    };

    const selectHaul = (haulIndex: number) => {
      selectedHaul.value = haulIndex;
      selectedCatch.value = null;

      getHaulStartDateTime();
      getHaulEndDateTime();
      // haulStartTime.value = moment(tripCatch.hauls[selectedHaul.value - 1].startDateTime).format('HH:mm');
      // haulEndTime.value = moment(tripCatch.hauls[selectedHaul.value - 1].endDateTime).format('HH:mm');

      coordinates.value = {
        start: {
          lat: { deg: '', min: '', dd: '' },
          long: { deg: '', min: '', dd: '' }
        },
        end: {
          lat: { deg: '', min: '', dd: '' },
          long: { deg: '', min: '', dd: '' }
        }
      };

      if (tripCatch.hauls[selectedHaul.value - 1].startLatitude) {
        coordinates.value.start.lat.dd = tripCatch.hauls[selectedHaul.value - 1].startLatitude;
      }
      if (tripCatch.hauls[selectedHaul.value - 1].startLongitude) {
        coordinates.value.start.long.dd = Math.abs(tripCatch.hauls[selectedHaul.value - 1].startLongitude);
      }
      if (tripCatch.hauls[selectedHaul.value - 1].endLatitude) {
        coordinates.value.end.lat.dd = tripCatch.hauls[selectedHaul.value - 1].endLatitude;
      }
      if (tripCatch.hauls[selectedHaul.value - 1].endLongitude) {
        coordinates.value.end.long.dd = Math.abs(tripCatch.hauls[selectedHaul.value - 1].endLongitude);
      }

    };

    const haulPagination = {
      sortBy: 'departureDate',
      descending: false,
      rowsPerPage: 0
    };

    const haulSelected: any = ref([]);

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

    const catchSelected: any = ref([]);

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
        name: 'weight',
        label: 'Weight',
        field: 'weight',
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
      indexCatch();
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
        (row: any) => row.doc
      );

      for (const row of gearTypeOptionsRows.filter( (item: any) => item.isEm === true)) {
        gearTypeOptions.push(row);
      }

      gearTypeOptions.sort((a: any, b: any) => {
        if (parseInt(a.lookupVal, 10) > parseInt(b.lookupVal, 10)) {
          return 1;
        } else if (parseInt(a.lookupVal, 10) < parseInt(b.lookupVal, 10)) {
          return -1;
        } else {
          return 0;
        }
      });
    };

    const getGearTypeDescription = computed(
        () => {
          if (gearTypeOptions.map( (row: any) => row.lookupVal ).includes(tripCatch.hauls[selectedHaul.value - 1].gearTypeCode)) {
            return gearTypeOptions.find( (item: any) => item.lookupVal === tripCatch.hauls[selectedHaul.value - 1].gearTypeCode).description;
          } else {
            return tripCatch.hauls[selectedHaul.value - 1].gearTypeCode;
          }
        }
    );

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

    const skipperOptions: any = ref([]);
    const getSkipperOptions = async () => {
      const masterDb = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: 'vessel-permissions'
      };

      const vesselPermissions = await masterDb.view(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      const vesselId = state.vessel.activeVessel.coastGuardNumber ? state.vessel.activeVessel.coastGuardNumber : state.vessel.activeVessel.stateRegulationNumber;
      const authorizedPersonIds = vesselPermissions.rows[0].doc.vesselAuthorizations.filter(
        (vessel: any) => {
          return vessel.vesselIdNum === vesselId;
        }
      );
      if (authorizedPersonIds.length > 0) {
        for (const personId of authorizedPersonIds[0].authorizedPeople) {
          const personAlias = await masterDb.get(personId);
          if (personAlias.isActive && personAlias.roles.includes('captain')) {
            skipperOptions.value.push(personAlias.firstName + ' ' + personAlias.lastName);
          }
        }
      }
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
      speciesCodeOptions.push({
        speciesCode: 'UNST',
        commonName: 'Unsorted catch not sampled'
      });
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
      await getCatchApiCatch(id).then( async (res1: any) => {
        if (res1 !== 'not found' && res1.filter( (row: any) => row.source === 'logbook').length > 0) {
          for (const row of res1) {
            if (row.source === 'logbook') {
              if (!row.fishTickets) {
                row.fishTickets = [];
              }
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
              const apiTrip: any = {
                tripNum: res.tripNum,
                year: moment(res.departureDate).format('YYYY'),

                isEFPTrip: false,
                isObserved: res.isSelected ? res.isSelected : false,
                isSigned: true,
                isVoid: false,
                buyers: [],
                fishTickets: [],
                hauls: [],
                permitNumber: res.permits,
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
          });
        }
      });
    };

    const getPort = (portCodeOrName: string) => {
      if (typeof portCodeOrName !== 'string') {
        return null;
      }
      const port = ports.find( (portItem: any) => portItem.PCID.toLowerCase().includes(portCodeOrName.toLowerCase())
                                              ||
                                              portItem.NAME.toLowerCase().includes(portCodeOrName.toLowerCase())
                                              );
      if (port) {
        return port;
      } else {
        return null;
      }
    };

    const getPortCode = (portCode: string) => {
      const port = getPort(portCode);
      if (port) {
        return port.PCID;
      } else {
        return '';
      }
    };

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
    };

    const submitLogbook = () => {
      tripCatch.updatedBy = authService.getCurrentUser()!.username;
      tripCatch.updatedDate = moment().format();
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
          getCatch(tripCatch.tripNum).then(() => {
            // getDepartureTime();
            // getReturnTime();
            getDepDateTime();
            getRetDateTime();
          });
        });
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
          getCatch(tripCatch.tripNum).then(() => {
            // getDepartureTime();
            // getReturnTime();
            getDepDateTime();
            getRetDateTime();
          });
        });
      }
    };

    const formatDateTime = (val: any) => {
      if (val) {
        return moment(val).format('MM/DD/YYYY HH:mm');
      }
    };

    const formatDate = (val: any) => {
      if (val) {
        return moment(val).format('MM/DD/YYYY');
      }
    };

    const indexCatch = () => {
      for (const haul of tripCatch.hauls) {
        if (haul.catch) {
          for (const catchItem of haul.catch) {
            catchItem.index = haul.catch.indexOf(catchItem);
          }
        }
      }
    };

    const coordinates: any = ref({
      start: {
        lat: { deg: '', min: '', dd: '' },
        long: { deg: '', min: '', dd: '' }
      },
      end: {
        lat: { deg: '', min: '', dd: '' },
        long: { deg: '', min: '', dd: '' }
      }
    });

    let oldCoordVals: any = {
      start: {
        lat: { deg: '', min: '', dd: '' },
        long: { deg: '', min: '', dd: '' }
      },
      end: {
        lat: { deg: '', min: '', dd: '' },
        long: { deg: '', min: '', dd: '' }
      }
    };

    const watcherOptions: WatchOptions = {
      immediate: false, deep: true
    };

    watch(
      () => coordinates.value,
      (newVal, oldVal) => {

        // conversions
        const getDecimal = (degrees: any, minutes: any) => {
          const decimal = parseFloat((parseFloat(degrees) + (parseFloat(minutes) / 60)).toFixed(5));
          if (decimal) {
            return decimal;
          } else {
            return '';
          }
        };

        const getDegMin = (decimal: number) => {
          const degrees = Math.trunc(decimal);
          const minutes = parseFloat(((decimal - degrees) * 60).toFixed(5));
          if (degrees && minutes) {
            return [ degrees, minutes ];
          } else {
            return ['', ''];
          }
        };

        if (coordinates.value.start.lat.dd !== oldCoordVals.start.lat.dd ||
            coordinates.value.start.long.dd !== oldCoordVals.start.long.dd ||
            coordinates.value.end.lat.dd !== oldCoordVals.end.lat.dd ||
            coordinates.value.end.long.dd !== oldCoordVals.end.long.dd
        ) {
          if (coordinates.value.start.lat.dd !== '') {
            [coordinates.value.start.lat.deg, coordinates.value.start.lat.min] = getDegMin(coordinates.value.start.lat.dd);
            tripCatch.hauls[selectedHaul.value - 1].startLatitude = coordinates.value.start.lat.dd;
          }
          if (coordinates.value.start.long.dd !== '') {
            [coordinates.value.start.long.deg, coordinates.value.start.long.min] = getDegMin(coordinates.value.start.long.dd);
            if (coordinates.value.start.long.dd > 0) {
              tripCatch.hauls[selectedHaul.value - 1].startLongitude = - coordinates.value.start.long.dd;
            } else {
              tripCatch.hauls[selectedHaul.value - 1].startLongitude = coordinates.value.start.long.dd;
            }
          }
          if (coordinates.value.end.lat.dd !== '') {
            [coordinates.value.end.lat.deg, coordinates.value.end.lat.min] = getDegMin(coordinates.value.end.lat.dd);
            tripCatch.hauls[selectedHaul.value - 1].endLatitude = coordinates.value.end.lat.dd;
          }
          if (coordinates.value.end.long.dd !== '') {
            [coordinates.value.end.long.deg, coordinates.value.end.long.min] = getDegMin(coordinates.value.end.long.dd);
            if (coordinates.value.end.long.dd > 0) {
              tripCatch.hauls[selectedHaul.value - 1].endLongitude = - coordinates.value.end.long.dd;
            } else {
              tripCatch.hauls[selectedHaul.value - 1].endLongitude = coordinates.value.end.long.dd;
            }
          }
        } else {
          if (coordinates.value.start.lat.deg !== '' && coordinates.value.start.lat.min !== '') {
            coordinates.value.start.lat.dd = getDecimal(coordinates.value.start.lat.deg, coordinates.value.start.lat.min);
            tripCatch.hauls[selectedHaul.value - 1].startLatitude = coordinates.value.start.lat.dd;
          }
          if (coordinates.value.start.long.deg !== '' && coordinates.value.start.long.min !== '') {
            coordinates.value.start.long.dd = getDecimal(coordinates.value.start.long.deg, coordinates.value.start.long.min);
            tripCatch.hauls[selectedHaul.value - 1].startLongitude = - coordinates.value.start.long.dd;
          }
          if (coordinates.value.end.lat.deg !== '' && coordinates.value.end.lat.min !== '') {
            coordinates.value.end.lat.dd = getDecimal(coordinates.value.end.lat.deg, coordinates.value.end.lat.min);
            tripCatch.hauls[selectedHaul.value - 1].endLatitude = coordinates.value.end.lat.dd;
          }
          if (coordinates.value.end.long.deg !== '' && coordinates.value.end.long.min !== '') {
            coordinates.value.end.long.dd = getDecimal(coordinates.value.end.long.deg, coordinates.value.end.long.min);
            tripCatch.hauls[selectedHaul.value - 1].endLongitude = - coordinates.value.end.long.dd;
          }
        }

        oldCoordVals = _.cloneDeep(coordinates.value);
      }, watcherOptions
    );

    const isMobile = computed(
      () => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          return true;
        } else {
          return false;
        }
      }
    );

    const depDateTime: any = ref('');
    const getDepDateTime = () => {
      if (tripCatch.departureDateTime) {
        depDateTime.value = new Date(moment(tripCatch.departureDateTime).format());
      }
    };
    watch(
      () => depDateTime.value,
      (newVal, oldVal) => {
        tripCatch.departureDateTime = moment(depDateTime.value).format();
      },
      watcherOptions
    );

    const retDateTime: any = ref('');
    const getRetDateTime = () => {
      if (tripCatch.returnDateTime) {
        retDateTime.value = new Date(moment(tripCatch.returnDateTime).format());
      }
    };
    watch(
      () => retDateTime.value,
      (newVal, oldVal) => {
        tripCatch.returnDateTime = moment(retDateTime.value).format();
      },
      watcherOptions
    );

    const addFishTicket = () => {
      if (!tripCatch.fishTickets) { tripCatch.fishTickets = []; }
      tripCatch.fishTickets.push({fishTicketNumber: '', fishTicketDate: ''});
    };

    const fishTicketDates: any = ref([]);
    const getFishTickDates = () => {
      for (const ft of tripCatch.fishTickets) {
        fishTicketDates.value.push(new Date(moment(ft.fishTicketDate).format()));
      }
    };

    watch(
      () => fishTicketDates.value,
      (newVal, oldVal) => {
        for (const [i, val] of fishTicketDates.value.entries()) {
          tripCatch.fishTickets[i].fishTicketDate = val;
        }
      },
      watcherOptions
    );

    const haulStartDateTime: any = ref('');
    const getHaulStartDateTime = () => {
      if (tripCatch.hauls[selectedHaul.value - 1].startDateTime) {
        haulStartDateTime.value = new Date(moment(tripCatch.hauls[selectedHaul.value - 1].startDateTime).format());
      }
    };
    watch(
      () => haulStartDateTime.value,
      (newVal, oldVal) => {
        if (selectedHaul.value) {
          tripCatch.hauls[selectedHaul.value - 1].startDateTime = moment(haulStartDateTime.value).format();
        }
      },
      watcherOptions
    );

    const haulEndDateTime: any = ref('');
    const getHaulEndDateTime = () => {
      if (tripCatch.hauls[selectedHaul.value - 1].endDateTime) {
        haulEndDateTime.value = new Date(moment(tripCatch.hauls[selectedHaul.value - 1].endDateTime).format());
      }
    };
    watch(
      () => haulEndDateTime.value,
      (newVal, oldVal) => {
        if (selectedHaul.value) {
          tripCatch.hauls[selectedHaul.value - 1].endDateTime = moment(haulEndDateTime.value).format();
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
      getFisheryOptions();
      getGearTypeOptions();
      getPortDecoderPorts();
      getSkipperOptions();
      if (context.root.$route.params.id === 'new') {
        const dummyTrip: any = {
          tripNum: '00000',
          year: moment().format('YYYY'),
          isEFPTrip: false,
          isObserved: false,
          isSigned: true,
          isVoid: false,
          buyers: [],
          fishTickets: [],
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
          getDepDateTime();
          getRetDateTime();
        }, 500);
      } else {
        getCatch(context.root.$route.params.id).then(() => {
          getDepDateTime();
          getRetDateTime();
          indexCatch();
          getFishTickDates();
        });
      }
    });

    return {
      tripCatch,
      addCatch,
      addHaul,
      selectHaul,
      getClass,
      getHaulClass,
      selectedHaul,
      selectedCatch,
      fisheryOptions,
      gearTypeOptions,
      skipperOptions,
      formatDateTime,
      formatDate,
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
      submitLogbook,
      coordinates,
      depDateTime,
      retDateTime,
      isMobile,
      haulStartDateTime,
      haulEndDateTime,
      fishTicketDates,
      addFishTicket,
      getGearTypeDescription
    };
  }
});
</script>

<style scoped>

.logbook-element {
  width: 100%;
  max-width: 350px;
  margin: 5px !important;
}

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
   left: -342px;
   top: 5px;
   z-index: 999;
   white-space: nowrap;
}

.no-wrap {
  flex-wrap: none !important;
}

.selected {
  background-color: #007EC6 !important;
  color: white;
}
.q-field--with-bottom {
    padding-bottom: 5px !important;
}

* >>> .p-inputtext {
  vertical-align: baseline;
  font-weight: bold !important;
  width: 350px;
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
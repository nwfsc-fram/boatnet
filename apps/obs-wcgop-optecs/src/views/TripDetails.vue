<template>
  <q-page padding>
    <div class="text-h6">Trip #{{tripNum}} Details</div>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="start">
        <div class="q-pa-md">
          <div class="q-gutter-md row">
            <q-input outlined v-model="text"/>

            <q-input outlined v-model="text" label="Label (stacked)" stack-label/>

            <q-input outlined v-model="text" label="Label"/>

            <q-input
              outlined
              v-model="ph"
              label="Label"
              placeholder="Placeholder"
              hint="With placeholder"

            />

            <q-input
              outlined
              v-model="ph"
              placeholder="Placeholder"
              hint="With placeholder"

            />

            <q-input
              outlined
              square
              v-model="text"
              hint="With perfect square borders"

            />

            <q-input outlined v-model="text">
              <template v-slot:prepend>
                <q-icon name="event"/>
              </template>
            </q-input>

            <q-input outlined v-model="text">
              <template v-slot:append>
              </template>
            </q-input>

            <q-input outlined bottom-slots v-model="text" label="Label" counter>
              <template v-slot:prepend>
                <q-icon name="place"/>
              </template>
              <template v-slot:append>
                <q-icon name="close" @click="text = ''" class="cursor-pointer"/>
              </template>

              <template v-slot:hint>Field hint</template>
            </q-input>

          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="end">
        <div class="q-pa-md">
          <div class="q-gutter-md row">
            <q-input outlined v-model="text"/>

            <q-input
              outlined
              bottom-slots
              v-model="text"
              label="Label"
              counter
              maxlength="12"

            >
              <template v-slot:before>
                <q-icon name="flight_takeoff"/>
              </template>

              <template v-slot:append>
                <q-icon v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer"/>
                <q-icon name="search"/>
              </template>

              <template v-slot:hint>Field hint</template>
            </q-input>

            <q-input
              outlined
              bottom-slots
              v-model="text"
              label="Label"
              counter
              maxlength="12"

            >
              <template v-slot:before>
              </template>

              <template v-slot:append>
                <q-icon v-if="text !== ''" name="close" @click="text = ''" class="cursor-pointer"/>
                <q-icon name="schedule"/>
              </template>

              <template v-slot:hint>Field hint</template>

              <template v-slot:after>
                <q-btn round dense flat icon="send"/>
              </template>
            </q-input>

            <q-input
              outlined
              bottom-slots
              v-model="text"
              label="Label"
              counter
              maxlength="12"

            >
              <template v-slot:before>
                <q-icon name="event"/>
              </template>

              <template v-slot:hint>Field hint</template>

              <template v-slot:append>
                <q-btn round dense flat icon="add"/>
              </template>
            </q-input>

            <q-input outlined v-model="text" hint="Disable" disable/>

            <q-input outlined v-model="text" hint="Readonly" readonly/>

            <q-input
              outlined
              v-model="text"
              hint="Disable and readonly"

              disable
              readonly
            />
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <q-option-group
      v-model="tab"
      inline
      :options="[
          { label: '', value: 'start' },
          { label: '', value: 'end' },
        ]"
    />
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

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
  private wcgopTripData: any;
  private tab: string; // Current tab (start or end)
  private text = ''; // TEMP
  private ph = ''; // TEMP
  private dense = false;

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
      name: 'Sadie K'
    };

    const exampleTrip = {
      _id: '1',
      tripNum: 1,
      type: WcgopTripTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      program: 'Catch Shares',
      departurePort: examplePort,
      departureDate: moment().format(),
      returnPort: examplePort2,
      returnDate: moment()
        .add(1, 'days')
        .format(),
      vessel: exampleVessel,
      // ... other data
      legacy: {
        tripId: 123
      }
    };
    this.wcgopTripData = exampleTrip;
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

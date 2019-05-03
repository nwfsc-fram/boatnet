<template>
  <span>
    <div class="row justify-end">
      <q-input
        outlined
        bottom-slots
        v-model="searchText"
        label="Search"
        maxlength="12"
        style="width: 200px;"
        @focus="displayKeyboard"
        data-layout="normal"
      >
        <template v-slot:append>
          <q-icon
            v-if="searchText !== ''"
            name="close"
            @click="searchText = ''"
            class="cursor-pointer"
          />
          <q-icon name="search"/>
        </template>
      </q-input>
    </div>
    <q-table
      :data="tripsData"
      :columns="tripsSettings.columns"
      :row-key="tripsSettings.rowKey"
      selection="single"
      :selected.sync="selected"
    />
    <!-- TODO: Figure out why row-key doesn't work with name -->
    <!-- TODO: use q-tr, q-td etc for custom rows with no checkbox -->

    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <q-dialog v-model="confirmDelete" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="red" text-color="white" />
          <span class="q-ml-sm">Are you sure you want to delete trip #{{tripNum}}?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup/>
          <q-btn flat label="Delete Trip" color="primary" @click="onDeleteTrip" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="row q-gutter-sm q-pt-sm">
      <q-btn color="primary" icon="add" label="Add Trip" @click="onAddTrip"/>
      <q-btn
        color="primary"
        icon="edit"
        label="Edit Trip"
        @click="onEditTrip"
        :disabled="!currentTrip"
      />
      <q-btn
        color="primary"
        icon="done"
        label="End Trip"
        @click="onEndTrip"
        :disabled="!currentTrip"
      />
      <q-btn
        color="primary"
        icon="delete_forever"
        label="Delete Trip"
        @click="confirmDelete = true"
        :disabled="!currentTrip"
      />
      <q-space/>
      <q-btn color="primary" icon="play_arrow" label="Go to Hauls"/>
    </div>
  </span>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BoatnetTripsSettings } from '@boatnet/bn-common';
import { BaseTrip } from '@boatnet/bn-models';

@Component
export default class BoatnetTrips extends Vue {
  @Prop() public tripsSettings!: BoatnetTripsSettings;
  @Prop() public tripsData!: any[];
  @Prop() public currentTrip!: BaseTrip;
  public selected: any[] = [];
  private searchText = '';
  private confirmDelete = false;
  @Watch('selected', { immediate: true })
  private onSelectedChanged(newSelected: any) {
    // TODO: Better way to handle this?
    const trip = newSelected ? newSelected[0] : undefined;
    if (trip) {
      delete trip.__index; // remove weird __index field for converting to trip
    }
    this.$emit('selectedTrip', trip);
  }

  private get tripNum() {
    if (this.currentTrip) {
      return this.currentTrip.tripNum;
    }
  }
  // Button click emitters
  private onAddTrip() {
    this.$emit('addTrip');
  }

  private onEditTrip() {
    this.$emit('editTrip', this.currentTrip);
  }

  private onEndTrip() {
    this.$emit('endTrip', this.currentTrip);
  }

  private onDeleteTrip() {
    this.$emit('deleteTrip', this.currentTrip);
  }

  private displayKeyboard(e: any) {
    this.$emit('displayKeyboard', e.target);
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
.q-btn {
  height: 75px;
}
</style>
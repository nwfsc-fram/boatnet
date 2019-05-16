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
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click.native="selectTrip(props.row)" class="cursor-pointer">
          <q-td/>
          <q-td key="tripNum" :props="props">{{ props.row.tripNum }}</q-td>
          <q-td key="vesselName" :props="props">{{ props.row.vessel.vesselName }}</q-td>
          <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
          <q-td key="departureDate" :props="props">{{ formatDate(props.row.departureDate) }}</q-td>
          <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
          <q-td key="returnDate" :props="props">{{ formatDate(props.row.returnDate) }}</q-td>
          <q-td key="errors" :props="props">{{ props.row.errors }}</q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- TODO: Figure out why row-key doesn't work with name -->
    <!-- TODO: use q-tr, q-td etc for custom rows with no checkbox -->

    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <boatnet-delete-dialog
      :message="deleteMessage"
      :show.sync="showDeleteDialog"
      @confirmDelete="onDeleteTrip"
    />

    <div class="row q-gutter-sm q-pa-md absolute-bottom">
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
        @click="showDeleteDialog = true"
        :disabled="!currentTrip"
      />
      <q-space/>
      <q-btn color="primary" icon="play_arrow" label="Go to Hauls" @click="goToHauls"/>
    </div>
  </span>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BoatnetTripsSettings } from '@boatnet/bn-common';
import { BaseTrip } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class BoatnetTrips extends Vue {
  @Prop() public tripsSettings!: BoatnetTripsSettings;
  @Prop() public tripsData!: any[];
  @Prop() public currentTrip!: BaseTrip;
  public selected: any[] = [];
  private searchText = '';

  private showDeleteDialog = false;

  private get deleteMessage() {
    if (this.currentTrip) {
      return 'Are you sure you want to delete trip #' + this.currentTrip.tripNum + '?';
    }
  }

  private formatDate(date: string) {
    return moment(date).format('MM/DD/YY');
  }

  // Button click emitters
  private onAddTrip() {
    this.$emit('addTrip');
  }

  private goToHauls() {
    this.$emit('goToHauls');
  }

  private selectTrip(row: any) {
    if (this.selected.length > 0 && this.selected[0].tripNum === row.tripNum) {
      this.selected = [];
      this.$emit('selectedTrip', undefined);
    } else {
      this.selected = [row];
      delete row.__index;
      this.$emit('selectedTrip', row);
    }
  }

  private onEditTrip() {
    this.$emit('editTrip');
  }

  private onEndTrip() {
    this.$emit('endTrip');
  }

  private onDeleteTrip() {
    this.$emit('deleteTrip');
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
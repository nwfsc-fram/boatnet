<template>
  <q-page padding>
    <div class="row justify-end">
      <q-input
        outlined
        bottom-slots
        v-model="searchText"
        label="Search"
        maxlength="12"
        style="width: 200px;"
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
      row-key="name"
      selection="single"
      :selected.sync="selected"
    />

    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <div class="row q-gutter-sm q-pt-sm">
      <q-btn color="primary" icon="add" label="Add Trip"/>
      <q-btn color="primary" icon="edit" label="Edit Trip" disabled="true"/>
      <q-btn color="primary" icon="done" label="End Trip" disabled="true"/>
      <q-btn color="primary" icon="delete_forever" label="Delete Trip" disabled="true"/>
      <q-space/>
      <q-btn color="primary" icon="play_arrow" label="Go to Hauls"/>
    </div>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { BoatnetTripsSettings } from '@boatnet/bn-common';

@Component
export default class Trips extends Vue {
  @Prop() public tripsSettings!: BoatnetTripsSettings;
  @Prop() public tripsData!: any[];
  public selected: any[] = [];

  private searchText = '';

  @Watch('selected', { immediate: true})
  private onSelectedChanged(newSelected: any) {
    console.log('KLICK CLIC', JSON.stringify(newSelected[0]));
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

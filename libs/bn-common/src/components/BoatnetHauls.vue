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
    <q-table :data="haulsData" :columns="haulsSettings.columns" :selected.sync="selected"/>

    <!-- <div class="q-mt-md">Selected: {{ JSON.stringify(selected) }}</div> -->
    <div class="row">
      <q-btn color="primary" icon="playlist_add" label="Add Haul"/>
      <q-btn icon="edit" label="Edit Haul" disabled="true"/>
      <q-btn icon="done" label="End Haul" disabled="true"/>
      <q-btn icon="delete_forever" label="Delete Haul" disabled="true"/>
      <q-space/>
      <q-btn icon="play_arrow" label="Go to Logbook Mode"/>
      <q-btn icon="play_arrow" label="Go to Catch"/>
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { BoatnetHaulsSettings } from '../models/BoatnetHaulsSettings';

@Component
export default class BoatnetHauls extends Vue {
  @Prop() public haulsSettings!: BoatnetHaulsSettings;
  @Prop() public haulsData!: any[];
  @Prop() public selected: any;
  private searchText = '';
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

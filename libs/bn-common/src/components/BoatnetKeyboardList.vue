<template>
  <q-list bordered padding class="rounded-borders">
    <div v-for="(name) in getSortedAndCuratedList" :key="name">
      <q-item
        clickable
        :active="selectedValue === name"
        @click="setSelected(name)"
        active-class="my-menu-link"
      >
        <q-item-section>{{name}}</q-item-section>
      </q-item>
    </div>
  </q-list>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { stringify } from 'querystring';
import { Action, Getter } from 'vuex-class';

@Component
export default class BoatnetKeyboardList extends Vue {
  @Prop() public list!: string[];
  @Prop() public value!: string;
  private selectedValue: string = '';

  @Action('setValueSelected', { namespace: 'keyboard' })
  private setValueSelected: any;

  private setSelected(value: string) {
    this.selectedValue = value;
    this.$emit('selected', value);
    this.setValueSelected(true);
  }

  private get getSortedAndCuratedList() {
    return this.list.filter((item: string) =>
      item.toLowerCase().includes(this.value.toLowerCase())
    ).slice(0, 4);
  }
}
</script>

<style scoped>
.my-menu-link {
  color: white;
  background: #f2c037;
}
</style>
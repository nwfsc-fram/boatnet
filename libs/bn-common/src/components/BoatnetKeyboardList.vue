<template>
  <q-list bordered padding class="scroll rounded-borders">
    <div v-for="(name) in getSortedAndCuratedList" :key="name" class="item">
      <q-item
        clickable
        :active="value === name"
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

  @Action('setValueSelected', { namespace: 'keyboard' })
  private setValueSelected: any;

  private setSelected(value: string) {
    this.$emit('selected', value);
    this.setValueSelected(true);
  }

  private get getSortedAndCuratedList() {
    return this.list.filter((item: string) =>
      item.toLowerCase().includes(this.value ? this.value.toLowerCase() : '')
    );
  }
}
</script>

<style scoped>
.my-menu-link {
  color: white;
  background: #027be3;
}
.item {
  background: white;
}
</style>
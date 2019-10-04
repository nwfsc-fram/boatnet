<template>
  <q-list bordered padding class="rounded-borders list">
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
export default class BoatnetKeyboard extends Vue {
  @Prop({ default: function() {
    return ['fish1', 'shark', 'fish3', 'fish4', 'nemo', 'dori'];
  }}) public list!: string[];

  @Action('setInput', { namespace: 'keyboard' })
  private setInput: any;
  @Getter('input', { namespace: 'keyboard' })
  private input!: string;

  private selectedValue: string = 'inbox';

  private setSelected(value: string) {
    this.selectedValue = value;
    this.setInput(value);
  }

  private get getSortedAndCuratedList() {
    return this.list.filter((item: string) =>
      item.toLowerCase().includes(this.input.toLowerCase())
    ).slice(0, 4);
  }
}
</script>

<style scoped>
.my-menu-link {
  color: white;
  background: #f2c037;
}

.list {
  position: absolute;
  right: 210px;
  bottom: 0;
  z-index: 10000;
  height: 200px;
}
</style>
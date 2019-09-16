<template>
  <div>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel v-for="i in size" :key="i" :name="'panel' + i">
        <slot :name="'title' + i" v-bind:panelNum="i"/>
        <div class="row" style="height:560px; max-height: 100%;">
          <div v-if="i != 1" class="col-1 self-center">
            <q-btn flat dense round @click="changeTab(i - 1)" icon="chevron_left" size="3em"/>
          </div>
          <div class="col">
            <slot :name="'content' + i"/>
          </div>
          <div v-if="i != size" class="col-2 self-center">
            <q-btn flat dense round @click="changeTab(i + 1)" icon="chevron_right" size="3em"/>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <div class="row justify-center">
      <q-option-group v-model="tab" inline :options="tabNavigator"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BoatnetTabPanel extends Vue {
  @Prop() private size!: number;
  private tab!: string;
  private tabNavigator: any[] = [];

  constructor() {
    super();
    this.tab = 'panel1';
    for (let i = 1; i <= this.size; i++) {
      const panelName = 'panel' + i;
      this.tabNavigator.push({ label: '', value: panelName });
    }
  }

  private changeTab(index: number) {
    this.tab = 'panel' + index;
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

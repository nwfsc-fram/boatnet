<template>
  <div>
    <div class="q-gutter-y-md">
      <q-card v-if="showData">
        <q-tabs
          v-model="tab"
          dense
          class="bg-grey-3 text-black"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="cruises" label="Cruises" />
          <q-tab name="trips" label="Trips" />
          <q-tab name="operations" label="Hauls" />
          <q-tab name="catch" label="Catch" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="cruises">
            <app-debriefer-cruises/>
          </q-tab-panel>
          <q-tab-panel name="trips">
            <app-debriefer-trips></app-debriefer-trips>
          </q-tab-panel>

          <q-tab-panel name="operations">
            <app-debriefer-operations></app-debriefer-operations>
          </q-tab-panel>

          <q-tab-panel name="catch">
            <app-debriefer-catches></app-debriefer-catches>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { date } from 'quasar';
import { convertToObject } from 'typescript';

@Component
export default class DebrieferData extends Vue {
  @Prop({ default: true })
  private showErrors!: boolean;
  @Prop({ default: true })
  private showData!: boolean;

  private tab = 'cruises';

  private showBoth() {
    this.showErrors = true;
    this.showData = true;
  }

  private openNewDebriefingTab() {
    const route = '/observer-web/debriefer/qa';
    window.open(route, '_blank');
    this.showErrors = false;
  }
}
</script>
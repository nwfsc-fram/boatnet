<template>
  <q-list bordered padding class="scroll rounded-borders">
    <div v-for="(item) in getSortedAndCuratedList" :key="item._id" class="item">
      <q-item
        clickable
        :active="value === item"
        @click="setSelected(item)"
        active-class="my-menu-link"
      >
        <q-item-section>{{formatDisplayValue(item, displayFields)}}</q-item-section>
      </q-item>
    </div>
  </q-list>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { stringify } from 'querystring';
import { Action, Getter } from 'vuex-class';
import { get } from 'lodash';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { getOptions, formatDisplayValue } from '../helpers/getLookupsInfo';

@Component
export default class BoatnetKeyboardList extends Vue {
  @Prop() public value!: string;
  @Prop() public displayFields!: any[];
  @Prop() public docType!: string;
  @Prop() public valType!: string;

  @Action('setValueSelected', { namespace: 'keyboard' })
  private setValueSelected: any;

  @Getter('appMode', { namespace: 'appSettings' })
  private appMode!: string;

  private formatDisplayValue = formatDisplayValue;

  private list: any[] = [];
  private async created() {
    this.list = await this.initList();
  }

  private async initList() {
    return await getOptions(this.appMode.toString(), this.docType,
                            'lookups', this.displayFields);
  }

  private setSelected(value: any) {
    if (this.valType === 'string') {
      this.$emit('selected', formatDisplayValue(value, this.displayFields));
    } else if (this.valType === 'object') {
      this.$emit('selected', value.doc);
    }
    this.setValueSelected(true);
  }

  private get getSortedAndCuratedList() {
    return this.list.filter((item: string) =>
      formatDisplayValue(item, this.displayFields).toLowerCase().includes(this.value ? this.value.toLowerCase() : '')
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
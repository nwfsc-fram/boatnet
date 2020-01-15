<template>
  <q-list bordered padding class="scroll rounded-borders">
    <div v-for="(item) in getSortedAndCuratedList" :key="item._id" class="item">
      <q-item
        clickable
        :active="value === item"
        @click="setSelected(item)"
        active-class="my-menu-link"
      >
        <q-item-section>{{formatDisplayValue(item)}}</q-item-section>
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

  private list: any[] = [];
  private async created() {
    this.list = await this.initList();
  }

  private formatDisplayValue(row: any) {
    const listModelName: any = this.displayFields ? this.displayFields : [];
    let displayValue = '';
    for (let i: number = 0; i < listModelName.length; i++) {
      displayValue =
        i < listModelName.length - 1
          ? (displayValue += get(row, 'doc.' + listModelName[i]) + ' ')
          : (displayValue += get(row, 'doc.' + listModelName[i]));
      }
    return displayValue;
  }

  private sortDisplayValues(val1: any, val2: any) {
    const val1Name = this.formatDisplayValue(val1);
    const val2Name = this.formatDisplayValue(val2);
    if (val1Name > val2Name) {
      return 1;
    } else if (val1Name < val2Name) {
      return -1;
    } else {
      return 0;
    }
  }

  private async initList() {
    const pouchDB = pouchService.db;
    const queryOptions = {
      inclusive_end: true,
      ascending: false,
      include_docs: true,
      reduce: false,
      key: this.docType
    };

    const view = 'LookupDocs/' + this.appMode + '-lookups';
    const results = await pouchDB.query(
      view,
      queryOptions,
      pouchService.lookupsDBName
    );
    return results.rows.sort(this.sortDisplayValues);
  }

  private setSelected(value: string) {
    if (this.valType === 'string') {
      this.$emit('selected', this.formatDisplayValue(value));
    } else if (this.valType === 'object') {
      this.$emit('selected', value);
    }
    this.setValueSelected(true);
  }

  private get getSortedAndCuratedList() {
    return this.list.filter((item: string) =>
      this.formatDisplayValue(item).toLowerCase().includes(this.value ? this.value.toLowerCase() : '')
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
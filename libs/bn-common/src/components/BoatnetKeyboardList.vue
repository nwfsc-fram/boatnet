<template>
  <q-list bordered padding class="scroll rounded-borders">
    <div v-for="(item) in getSortedAndCuratedList" :key="item._id" class="item">
      <q-item
        clickable
        :active="value === item"
        @click="setSelected(item)"
        active-class="my-menu-link"
      >
        <q-item-section>{{format(item)}}</q-item-section>
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

  private list: any[] = [];
  private async created() {
    this.list = await this.initList();
  }

  private format(origValue: any) {
    if (typeof origValue === 'object') {
      const listModelName: any = this.displayFields ? this.displayFields : [];
      let tempValue = '';
      for (let i: number = 0; i < listModelName.length; i++) {
        tempValue =
          i < listModelName.length - 1
            ? (tempValue += get(origValue, listModelName[i]) + ' ')
            : (tempValue += get(origValue, listModelName[i]));
      }
      return tempValue;
    } else {
      return origValue;
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

    const results = await pouchDB.query(
      'obs_web/all_doc_types',
      queryOptions,
      pouchService.lookupsDBName
    );
    console.log(results);
    const resultList = [];
    for (const result of results.rows) {
      this.valType === 'string' ? resultList.push(this.format(result.doc)) : resultList.push(result.doc);
    }
    console.log(resultList);
    return resultList;
  }

  private setSelected(value: string) {
    this.$emit('selected', value);
    this.setValueSelected(true);
  }

  private get getSortedAndCuratedList() {
    return this.list.filter((item: string) =>
      this.format(item).toLowerCase().includes(this.value ? this.value.toLowerCase() : '')
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
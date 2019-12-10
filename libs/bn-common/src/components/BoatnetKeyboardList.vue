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
import { get } from 'lodash';

@Component
export default class BoatnetKeyboardList extends Vue {
  @Prop() public value!: string;
  @Prop() public listLabels!: string[];

  @Action('setValueSelected', { namespace: 'keyboard' })
  private setValueSelected: any;

  private list: any[] = [];
  private created() {
    this.list = this.initList();
  }

  private initList() {
        // TODO remove static list and instead query pouch to get list
        if (this.listLabels) {
          const resultList = [
            {
              observer: {
                firstName: 'Paul',
                lastName: 'Pu'
              },
              startDate: '12/12/12',
              endDate: '1/1/20'
            },
            {
              observer: {
                firstName: 'Will',
                lastName: 'Smith'
              },
              startDate: '22/22/22',
              endDate: '3/3/3'
            }
          ];
          return this.formatList(resultList);
        }
        return [];
      }

    private formatList(items: any[]) {
      const listModelName: any = this.listLabels ? this.listLabels : [];
      const formattedList: any[] = [];
      for (const item of items) {
        let tempValue = '';
        for (let i: number = 0; i < listModelName.length; i++) {
          tempValue =
            i < listModelName.length - 1
              ? (tempValue += get(item, listModelName[i]) + ' ')
              : (tempValue += get(item, listModelName[i]));
        }
        formattedList.push(tempValue);
      }
      return formattedList;
    }

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
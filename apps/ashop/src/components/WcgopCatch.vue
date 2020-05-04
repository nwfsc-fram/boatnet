<template>
    <div>
        <boatnet-summary
            currentScreen="Species"
            :current="currentCatch"
            :selection-id="currentCatch ? currentCatch.catchNum : 0"
            @goTo="handleGoToWtCnt"
            @add="add"
            @edit="edit"
            @remove="del"
            @move="modify"
        >
        <template v-slot:table>
          <boatnet-tree-table
            :nodes="nodes"
            :settings="wcgopCatchTreeSettings"
            :expanded-keys="expandedKeys"
            @select="handleSelectCatch"
          />
        </template>
        </boatnet-summary>

    </div>
</template>

<script lang="ts">
import { createComponent, reactive, computed, ref, onMounted } from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';

import BoatnetSummary from '@boatnet/bn-common';
Vue.component(BoatnetSummary);

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const router = context.root.$router;
    const currentCatch = ref(store.state.tripsState.currentCatch);
    const currentHaul = ref(store.state.tripsState.currentHaul);

    const add = () => {console.log('add to catch')};
    const edit = () => {console.log('edit catch')};
    const del = () => {console.log('delete')};
    const modify = () => {console.log('modify catch')};
    const handleGoToWtCnt = () => {console.log('handle go to wt cnt')};
    const handleSelectCatch = () => {console.log('handle select catch')};

    const wcgopCatchTreeSettings = {
      rowKey: 'catchNum',
      columns: [
        { name: 'disposition', required: true, label: 'R/D', align: 'left', field: 'disposition', width: '8%' },
        { name: 'weightMethod', align: 'left', label: 'WM', field: 'weightMethod', width: '8%' },
        { name: 'name', align: 'left', label: 'Name', field: 'name', width: '44%', expander: true },
        { name: 'weight', align: 'left', label: 'Weight', field: 'weight', width: '12%' },
        { name: 'count', align: 'left', label: 'Count', field: 'count', width: '12%' },
        { name: 'discardReason', align: 'left', label: 'Discard Reason', field: 'discardReason', width: '16%' }
      ]
    };

    const expandedKeys: any = [];

    const nodes = computed(() => {
        const nodes: any = [
            {
            key: '0',
            data: {
                disposition: 'retained',
                weightMethod: 17,
                discardReason: 'blah',
                name: 'fish',
                weight: 7,
                count: 7
            },
            children: [
                {
                key: '0-0',
                data: {
                    disposition: 'retained',
                    discardReason: 'halp',
                    name: 'dewa',
                    weight: 8,
                    count: 3
                },
                children: [
                    {
                    key: '0-0-0',
                    data: {
                        disposition: 'retained',
                        discardReason: 'halp',
                        name: 'dewa',
                        weight: 8,
                        count: 3
                    }
                    }
                ]
                }

            ]
            },
            {
            key: '1',
            data: {
                disposition: 'retained',
                discardReason: 'blah',
                name: 'fish',
                weight: 7,
                count: 7
            }
            },
        ];
        return nodes;
    })

    onMounted( () => {
        if (!currentHaul.value.catches || currentHaul.value.catches.length === 0) {
            currentHaul.value.catches = [
                {
                catchNum: 0,
                catchContent: {
                    type: 'unsorted-catch',
                    label: 'what should this be labeled?'
                },
                disposition: undefined,
                weightMethod: undefined,
                weight: { units: 'lbs', value: 0 },
                count: 0,
                discardReason: undefined,
                children: []
                }
            ];
        }
        store.dispatch('tripsState/setCurrentCatch', currentHaul.value.catches[0]);
    })

    return {
        store,
        currentCatch,
        currentHaul,
        add,
        edit,
        del,
        modify,
        handleGoToWtCnt,
        nodes,
        expandedKeys,
        wcgopCatchTreeSettings,
        handleSelectCatch
    };
  }
});

</script>

<style scoped>
</style>
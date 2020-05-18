<template>
    <span>
        <q-page>
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
        {{ currentCatch }}
        </q-page>

        <boatnet-drawer
        :show.sync="openDrawer"
        side="right"
        >
            <template v-slot:main>
                <div class="row">
                    <div class="col">
                        <boatnet-pick-list
                            title="Species"
                            docType="taxonomy-alias"
                            :displayFields="['commonNames[0]']"
                            :val.sync="currentCatch.species"
                            :searchable="true"
                            :showFrequentToggle="true"
                        >
                        </boatnet-pick-list>
                    </div>

                    <div class="col">
                        <boatnet-push-button
                            title="Disposition"
                            docType="catch-disposition"
                            :displayFields="['description']"
                            :val.sync="currentCatch.disposition"
                            class="q-ma-md"
                        >
                        </boatnet-push-button>

                        <boatnet-button-toggle-comp
                            title="Weight Method"
                            :val.sync="currentCatch.weightMethod"
                            :showDescription="true"
                            docType="weight-method"
                            docTypeDb="lookups"
                            :displayFields="['lookupVal']"
                            valueField="lookupVal"
                            :splitAt="5"
                        >
                        </boatnet-button-toggle-comp>

                        <span class=q-ma-md><b>Extrapolation</b></span>
                        <div class="q-ml-md">
                            <boatnet-keyboard-select-list
                                :val.sync="currentCatch.catchWeight"
                                title="Catch Weight"
                                keyboardType="numeric"
                                valType="string"
                            >
                            </boatnet-keyboard-select-list>
                            <boatnet-keyboard-select-list
                                :val.sync="currentCatch.numFish"
                                title="Total Number of Fish"
                                keyboardType="numeric"
                                valType="string"
                            >
                            </boatnet-keyboard-select-list>
                        </div>

                        <boatnet-button-toggle-comp
                            v-if="currentCatch.disposition &&  currentCatch.disposition.description === 'Discarded'"
                            title="Discard Reason"
                            :val.sync="currentCatch.discardReason"
                            :showDescription="true"
                            docType="discard-reason"
                            docTypeDb="lookups"
                            :displayFields="['lookupVal']"
                            valueField="lookupVal"
                            :splitAt="5"
                        >
                        </boatnet-button-toggle-comp>

                        <div style="text-align: center">
                            <br><br>
                            <q-btn color="primary">Update</q-btn>
                        </div>

                    </div>
                </div>

            </template>
        </boatnet-drawer>

    </span>
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
    const openDrawer = ref(true);

    const add = () => {
                        openDrawer.value = true;
                        console.log('add to catch');
                        };
    const edit = () => {console.log('edit catch'); };
    const del = () => {console.log('delete'); };
    const modify = () => {console.log('modify catch'); };
    const handleGoToWtCnt = () => {console.log('handle go to wt cnt'); };
    const handleSelectCatch = () => {console.log('handle select catch'); };

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
        const tempNodes = [
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
                disposition: 'discarded',
                discardReason: 'blah',
                name: 'fish',
                weight: 7,
                count: 7
            }
            },
        ];
        return tempNodes;
    });

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
    });

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
        handleSelectCatch,
        openDrawer
    };
  }
});

</script>

<style scoped>
</style>
<template>
    <span>
        <q-page>
        <div style="padding: 10px">
            <q-btn color="primary" @click="expandAll" >Expand All</q-btn>&nbsp;
            <q-btn color="grey" @click="collapseAll" > Collapse All </q-btn>
        </div>
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
            selectionMode="single"
            :isEditable="false"
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
                            :val.sync="catchModel.species"
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
                            :val.sync="catchModel.disposition"
                            class="q-ma-md"
                        >
                        </boatnet-push-button>

                        <boatnet-button-toggle-comp
                            title="Weight Method"
                            :val.sync="catchModel.weightMethod"
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
                                :val.sync="catchModel.catchWeight"
                                title="Catch Weight"
                                keyboardType="numeric"
                                valType="string"
                            >
                            </boatnet-keyboard-select-list>
                            <boatnet-keyboard-select-list
                                :val.sync="catchModel.numFish"
                                title="Total Number of Fish"
                                keyboardType="numeric"
                                valType="string"
                            >
                            </boatnet-keyboard-select-list>
                        </div>

                        <boatnet-button-toggle-comp
                            v-if="catchModel.disposition &&  catchModel.disposition.description === 'Discarded'"
                            title="Discard Reason"
                            :val.sync="catchModel.discardReason"
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
                            <q-btn color="primary" @click="updateCatch">Update</q-btn>
                        </div>

                        {{ catchModel }}

                    </div>
                </div>

            </template>
        </boatnet-drawer>

    </span>
</template>

<script lang="ts">
import { createComponent, reactive, computed, ref, onMounted, watch } from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WatchOptions } from 'vue';

import BoatnetSummary from '@boatnet/bn-common';
Vue.component(BoatnetSummary);

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const router = context.root.$router;
    const currentCatch = ref(store.state.tripsState.currentCatch);
    const currentHaul = ref(store.state.tripsState.currentHaul);
    const openDrawer = ref(true);
    const catchModel = ref(
        {
            species: {},
            disposition: {
                type: 'catch-disposition',
                description: 'Discarded'
                },
            weightMethod: '',
            catchWeight: '',
            numFish: '',
            discardReason: ''
        });

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
        { name: 'disposition', required: true, label: 'R/D', align: 'left', field: 'disposition', width: '40' },
        { name: 'weightMethod', align: 'left', label: 'WM', field: 'weightMethod', width: '40' },
        { name: 'name', align: 'left', label: 'Name', field: 'name', width: '240', expander: true },
        { name: 'weight', align: 'left', label: 'Weight', field: 'weight', width: '80' },
        { name: 'count', align: 'left', label: 'Count', field: 'count', width: '80' },
        { name: 'discardReason', align: 'left', label: 'Discard Reason', field: 'discardReason', width: '120' }
      ]
    };

    const expandedKeys = ref({});

    const nodes = computed(() => {
        const tempNodes = [
            {
            key: '0',
            data: {
                disposition: 'D',
                weightMethod: 14,
                name: 'Visual Experience',
                weight: 77,
                count: 7
            },
            children: [
                    {
                    key: '0-0',
                    data: {
                        discardReason: '7',
                        name: 'DOVR',
                        weight: 56,
                        count: 4
                    },
                    catch: 3
                    },
                    {
                    key: '0-1',
                    data: {
                        discardReason: '9',
                        name: 'SABL',
                        weight: 21,
                        count: 3
                    },
                    catch: 4
                    }
                ],
            catch: 1
            },
            {
            key: '1',
            data: {
                disposition: 'R',
                weightMethod: 9,
                name: 'Length/Weight',
                weight: 65,
                count: 7
            },
            catch: 2,
            children: [
                    {
                    key: '1-0',
                    data: {
                        discardReason: '',
                        name: 'AKSK',
                        weight: 56,
                        count: 4
                    },
                    catch: 3
                    },
                    {
                    key: '1-1',
                    data: {
                        discardReason: '9',
                        name: 'YEYE',
                        weight: 21,
                        count: 3
                    },
                    catch: 4
                    }
                ],
            },
        ];
        return tempNodes;
    });

    const updateCatch = () => {
        console.log(catchModel.value);
        console.log('TO DO!!!');
    }

    const expandAll = () => {
        console.log('expand all - to do');
    }

    const collapseAll = () => {
        expandedKeys.value = {};
    }

    const watcherOptions: WatchOptions = {
        immediate: false
    };

    const storedDiscardReason = ref('');
    watch(
        () => catchModel.value.disposition,
        (newVal, oldVal) => {
            console.log(newVal);
            if (newVal.description === 'Retained') {
                storedDiscardReason.value = catchModel.value.discardReason;
                catchModel.value.discardReason = '';
            } else {
                catchModel.value.discardReason = storedDiscardReason.value;
            }
        },
        watcherOptions
    );

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
        catchModel,
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
        openDrawer,
        updateCatch,
        expandAll,
        collapseAll
    };
  }
});

</script>

<style scoped>
</style>
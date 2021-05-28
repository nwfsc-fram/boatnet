<template>
    <q-select
        v-model="cruiseNum"
        use-input
        fill-input
        hide-selected
        :options="filteredCruiseList"
        style="width: 30%"
        label="Cruise Num"
        option-value="id"
        option-label="key"
        @filter="filterFn"
        @input="select"
    >
        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script lang="ts">
import { createComponent, ref, onMounted } from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';

import { filter } from 'lodash';
export default createComponent({
    props: {},

    setup(props, context) {
        const masterDB: Client<any> = couchService.masterDB;
        const store = context.root.$store;
        const cruiseNum: any = ref();
        const cruiseList: any = ref([]);
        const filteredCruiseList: any = ref([]);

        async function filterFn(val: any, update: any) {
            if (cruiseList.value.length === 0) {
                const result = await masterDB.viewWithDocs(
                    'obs_web',
                    'ashop_cruise'
                );
                cruiseList.value = result.rows;
            }
            update(() => {
                const needle = val.toLowerCase();
                filteredCruiseList.value = filter(
                    cruiseList.value,
                    (cruise: any) => {
                        const currLabel: string = cruise.key.toString();
                        return currLabel.startsWith(needle);
                    }
                );
            });
        }

        function select(selectedCruise: any) {
            store.dispatch('debriefer/updateCruises', [selectedCruise]);
        }

        return {
            cruiseNum,
            filteredCruiseList,
            filterFn,
            select
        };
    },
});
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

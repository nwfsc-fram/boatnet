<template>
    <div>
        <prime-table
            :value="operations"
            :columns="ashopColumns"
            type="Samples"
            uniqueKey="_id"
            :enableSelection="true"
            :isFullSize="isFullSize"
            :loading="loading"
            :showSelectionBoxes="false"
            :lookupsMap="lookupsMap"
        />
    </div>
</template>


<script lang="ts">
import {
    createComponent,
    ref,
    watch,
} from '@vue/composition-api';
import { couchService } from '@boatnet/bn-couch';
import { Client, ListOptions } from 'davenport';
import { cloneDeep, findIndex, orderBy, replace, slice } from 'lodash';

export default createComponent({
    props: {
        isFullSize: Boolean,
        lookupsMap: Array
    },
    setup(props, context) {
        const store = context.root.$store;
        const state: any = store.state;
        const masterDB: Client<any> = couchService.masterDB;
        const operations: any = ref([]);
        const loading: any = ref(false);
        const displayColumns: any = state.debriefer.displayColumns;
        const totalRecords: any = ref(0);

        const flatten = require('flat');
        const unflatten = flatten.unflatten;

        const ashopColumns: any[] = [];

        return {
            ashopColumns,
            displayColumns,
            operations,
            loading,
            totalRecords
        };
    },
});
</script>
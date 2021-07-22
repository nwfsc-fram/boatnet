<template>
    <q-table
        dense
        :data="tableData"
        :columns="columns"
        row-key="name"
        :visible-columns="formattedVisibleCols"
        no-data-label="No data"
        :loading="loading"
        :filter="filterHolder"
    >
        <template v-slot:top>
            <q-select
                v-if="visibleColumns"
                v-model="formattedVisibleCols"
                class="q-pr-md"
                multiple
                outlined
                dense
                options-dense
                :display-value="$q.lang.table.columns"
                emit-value
                map-options
                :options="columns"
                option-value="name"
                options-cover
                style="min-width: 150px"
            />
            <!--  <q-input dense debounce="300" color="primary" v-model="filter" class="q-ml-md">
                    <template v-slot:append>
                        <q-icon name="search" />
                    </template>
                </q-input>-->
            <q-space />
            <q-input
                dense
                debounce="300"
                v-model="filterHolder"
                borderless
                placeholder="Search"
            >
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
            <q-btn
                v-if="isDownloadable"
                class="q-ml-md"
                color="primary"
                icon-right="archive"
                label="Download"
                no-caps
                @click="exportTable"
            />
        </template>
        <template v-slot:header="props">
            <q-tr :props="props">
                <q-th auto-width />
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                    {{ col.label }}
                </q-th>
            </q-tr>
        </template>
        <template v-slot:body="props">
            <q-tr :props="props">
                <q-td auto-width>
                    <q-btn
                        size="sm"
                        color="primary"
                        round
                        dense
                        icon="delete_outline"
                        @click="deleteRow(props.row)"
                    >
                        <q-tooltip class="bg-accent">Delete Record</q-tooltip>
                    </q-btn>
                </q-td>
                <q-td v-for="col of columns" :key="col.field" :props="props">
                    {{ displayValue(props, col) }}
                    <q-popup-edit
                        v-if="col.isEditable"
                        v-model="props.row[col.field]"
                        buttons
                        :title="col.label"
                        @save="save(props.row, col, props.row[col.field])"
                    >
                        <debriefer-select-comp
                            v-if="col.type === 'select'"
                            :val.sync="props.row[col.field]"
                            lookupView="wcgop-lookups"
                            :lookupLabel="col.value ? col.value : 'value'"
                            :lookupValue="col.value ? col.value : 'value'"
                            :clearable="true"
                            :lookupQueryOptions="{ key: col.key }"
                        />
                        <q-input
                            v-else
                            v-model="props.row[col.field]"
                            :type="col.type"
                            dense
                            autofocus
                            counter
                        />
                    </q-popup-edit>
                </q-td>
            </q-tr>
        </template>
    </q-table>
</template>


<script lang="ts">
import { createComponent, ref } from '@vue/composition-api';
import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import { filter, get, round } from 'lodash';
import moment from 'moment';
import { exportFile } from 'quasar';

Vue.component('multiselect', Multiselect);

export default createComponent({
    props: {
        columns: Array,
        visibleColumns: Array,
        tableData: Array,
        loading: Boolean,
        isDownloadable: Boolean,
    },
    setup(props, context) {
        const filterHolder: any = ref('');
        const jp = require('jsonpath');
        const formattedVisibleCols: any = ref([]);

        function init() {
            formattedVisibleCols.value = jp.query(
                props.visibleColumns,
                '$[*].name'
            );
        }
        init();

        function displayValue(props: any, col: any) {
            let val = get(props.row, col.field);
            if (col.type === 'date') {
                val = moment(val).format('DD-MMM-YY, hh:mm');
            } else if (col.type === 'coord') {
                val = '[' + round(val[0], 2) + ', ' + round(val[1], 2) + ']';
            } else if (col.type === 'number' && val) {
                val = round(val, 2);
            }
            return val;
        }

        async function save(newValObj: any, colInfo: any, updatedVal: any) {
            context.emit('save', { newValObj, colInfo, updatedVal });
        }

        function deleteRow(val: any) {
            context.emit('delete', val);
        }

        function exportTable() {
            // naive encoding to csv format
            const currTableData: any[] = get(props, 'tableData', []);
            const currColumns: any[] = get(props, 'columns', []);

            const visibleCols = filter(
                currColumns,
                (col: any) => formattedVisibleCols.value.indexOf(col.name) >= 0
            );

            const content = [
                visibleCols.map((col: any) => wrapCsvValue(col.label)),
            ]
                .concat(
                    currTableData.map((row: any) =>
                        visibleCols
                            .map((col: any) =>
                                wrapCsvValue(
                                    typeof col.field === 'function'
                                        ? col.field(row)
                                        : row[
                                              col.field === void 0
                                                  ? col.name
                                                  : col.field
                                          ],
                                    col.format
                                )
                            )
                            .join(',')
                    )
                )
                .join('\r\n');

            const status = exportFile('bio-structures.csv', content, 'text/csv');
        }

        function wrapCsvValue(val: any, formatFn?: any) {
            let formatted = formatFn !== void 0 ? formatFn(val) : val;

            formatted =
                formatted === void 0 || formatted === null
                    ? ''
                    : String(formatted);

            formatted = formatted.split('"').join('""');
            /**
             * Excel accepts \n and \r in strings, but some other CSV parsers do not
             * Uncomment the next two lines to escape new lines
             */
            // .split('\n').join('\\n')
            // .split('\r').join('\\r')

            return `"${formatted}"`;
        }
        return {
            deleteRow,
            displayValue,
            exportTable,
            filterHolder,
            formattedVisibleCols,
            save,
        };
    },
});
</script>
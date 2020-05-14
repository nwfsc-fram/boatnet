<template>
    <div>
        <div class="q-ml-md">
            <b>{{title}}</b>
        </div>
        <boatnet-push-button
            v-if="showFrequentToggle"
            :options="['All', 'Frequent']"
            :val.sync="scope"

            class="q-ma-md"
        >
        </boatnet-push-button>

        <boatnet-keyboard-select-list
            :val.sync="searchText"
            displayName="Search"
            keyboardType="normal"
            valType="string"
            class="q-ma-md"
        >
            <template v-slot:after>
                <q-icon v-if="searchText.length > 0" name="clear" @click="searchText = ''"></q-icon>
            </template>
        </boatnet-keyboard-select-list>

        <q-scroll-area style="height: 500px;" class="q-ma-md">
            <q-list bordered separator>
                <q-item
                    v-for="(item) in filtered(options)"
                    :key="item._id"
                    :active="val === item"
                    clickable
                    @click="setSelected(item)"
                    active-class="my-menu-link"
                    >
                    <q-item-section><b>{{
                        item.commonNames ?
                        ( item.commonNames[0] + (item.taxonomy.pacfinSpeciesCode ? ' (' + item.taxonomy.pacfinSpeciesCode + ')' : '' ))
                        : item.name + ' ' + ' (' + item.code + ')'
                        }}</b></q-item-section>
                </q-item>
            </q-list>
        </q-scroll-area>
    </div>
</template>

<script lang="ts">
import { Vue, Watch } from 'vue-property-decorator';
import { createComponent, ref, computed, onMounted, watch } from '@vue/composition-api';
import { getOptions, formatDisplayValue } from '../helpers/getLookupsInfo';
import { get, set } from 'lodash';
import { WatchOptions } from 'vue';

export default createComponent({
    props: {
        title: String,
        docType: String,
        displayFields: Array,
        val: Object,
        searchable: Boolean,
        showFrequentToggle: Boolean
    },
    setup(props, context) {
        const options: any = ref([]);
        const docType = props.docType ? props.docType : '';
        const store: any = context.root.$store;
        const appConfig = store.state.appSettings.appConfig;
        const index: any = ref(0);
        const scope: any = ref('All');
        const searchText: any = ref('');

        const setSelected = (item: any) => {
            context.emit('update:val', item);
            context.emit('save');
        };

        const frequent =
        [
            'ZMIS',
            'ARTH',
            'CHLB',
            'CLPR',
            'CNRY',
            'DBRK',
            'DOVR',
            'EGLS',
            'INVT',
            'LCOD',
            'LSKT',
            'LSPN',
            'MBOT',
            'NSLP',
            'PCOD',
            'PDAB',
            'PHLB',
            'POP',
            'PTRL',
            'REX',
            'SABL',
            'SKAT',
            'SRMP',
            'SSOL',
            'SSPN',
            'STRY',
            'THDS',
            'YTRK'
        ];


        const filtered = (optionVals: any) => {
            if (searchText.value.length > 0) {
                return optionVals.filter( (option: any) => {
                    if (option.commonNames) {
                        return option.commonNames[0].toLowerCase().includes(searchText.value.toLowerCase()) ||
                        (option.taxonomy.pacfinSpeciesCode ? option.taxonomy.pacfinSpeciesCode.toLowerCase() : '').includes(searchText.value.toLowerCase());
                    } else if (option.name) {
                        return option.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
                        (option.code ? option.code.toLowerCase() : '').includes(searchText.value.toLowerCase());
                    }
                });
            } else if (scope.value === 'Frequent') {
                return optionVals.filter( (option: any) => {
                    if (option.commonNames && option.taxonomy && option.taxonomy.pacfinSpeciesCode) {
                        return frequent.includes(option.taxonomy.pacfinSpeciesCode);
                    } else if (option.name) {
                        return frequent.includes(option.code);
                    }
                });
            } else {
                return optionVals;
            }
        };

        const watcherOptions: WatchOptions = {
            immediate: false
        };

        watch(
            () => scope.value,
            (newVal: any, oldVal: any) => {
                searchText.value = '';
            },
            watcherOptions
        );

        onMounted(
            async () => {
                const results = await getOptions(appConfig.survey, docType,
                                    'lookups', props.displayFields);
                for (const result of results) {
                    options.value.push(result.doc);
                }
                if (docType === 'taxonomy-alias') {
                    const groupings = await getOptions(appConfig.survey, 'catch-grouping', 'lookups', ['commonNames[0]'] );
                    for (const grouping of groupings) {
                        if (!options.value.map( (opt: any) => {
                            if (opt.taxonomy && opt.taxonomy.pacfinSpeciesCode) {
                                return opt.taxonomy.pacfinSpeciesCode;
                            } else {
                                return;
                            }
                        }).includes(grouping.doc.code)) {
                            options.value.push(grouping.doc);
                        }
                    }
                }
            }
        );

        return {
            options, setSelected, scope, searchText, filtered
        };
    }
});
</script>

<style scoped>
    .my-menu-link {
        color: white;
        background: #027be3;
    }
</style>
<template>
    <div>
        <!-- {{ fresults }}
        <hr/>
        {{ sums }}
        <hr/>
        {{ displayValues }} -->
    </div>
</template>

<script lang="ts">

    import {
    createComponent,
    ref,
    reactive,
    computed,
    onMounted,
    watch
    } from '@vue/composition-api';
    import Vue, { WatchOptions } from 'vue';
    import {
        CouchDBInfo,
        CouchDBCredentials,
        couchService
    } from '@boatnet/bn-couch';
    import { Client, CouchDoc, ListOptions } from 'davenport';

    // import { results } from '../../../../../EM/ft_result';

    export default createComponent({
        setup(props, context) {
            // const results: any = [];
            // const fresults = results.map( (row: any) => {
            //     return {speciesCode: row.pacfin_species_code, landedWeight: row.landed_weight_lbs};
            //     }
            // );

            // const sums: any = {};
            // console.log(fresults);

            // for (const row of fresults) {
            //     if (!sums[row.speciesCode]) {
            //         sums[row.speciesCode] = 0;
            //     }
            //     sums[row.speciesCode] = parseFloat(sums[row.speciesCode]) + parseFloat(row.landedWeight);
            // }

            // const displayValues = [];

            // for (const species of Object.keys(sums)) {
            //     displayValues.push({species, weight: sums[species]});
            // }

            // return { displayValues, sums, fresults };

            onMounted(async () => {
                const masterDb = couchService.masterDB;
                const queryOptions = {
                    reduce: false,
                    include_docs: true,
                    key: 'DANGER!'
                };
                const getMatches = async () => {

                    const matches = await masterDb.view(
                        'obs_web',
                        'ots_trips_by_vesselId',
                        queryOptions
                    );
                    return matches.rows.map((row: any) => row.doc);
                };

                const results = await getMatches();
                console.log(results);

                for (const row of results) {
                    masterDb.delete(row._id, row._rev);
                }

            });

            return {};
        }

    });


</script>
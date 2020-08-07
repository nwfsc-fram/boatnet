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

    // import { results } from '../../../../../EM/ft_result';

    export default createComponent({
        setup(props, context) {
            const results: any = [];
            const fresults = results.map( (row: any) => {
                return {speciesCode: row.pacfin_species_code, landedWeight: row.landed_weight_lbs};
                }
            );

            const sums: any = {};
            console.log(fresults);

            for (const row of fresults) {
                if (!sums[row.speciesCode]) {
                    sums[row.speciesCode] = 0;
                }
                sums[row.speciesCode] = parseFloat(sums[row.speciesCode]) + parseFloat(row.landedWeight);
            }

            const displayValues = [];

            for (const species of Object.keys(sums)) {
                displayValues.push({species, weight: sums[species]});
            }

            return { displayValues, sums, fresults };
        }

    });


</script>
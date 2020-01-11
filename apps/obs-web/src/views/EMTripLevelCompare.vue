<template>
    <div class='q-pa-md  q-gutter-md'>
        <div>Hello {{ fish }}</div>
    </div>
</template>

<script lang="ts">

import { createComponent, ref, reactive, computed, watch, onBeforeUnmount } from '@vue/composition-api';

export default createComponent({
    setup(props, context) {
        const fish = context.root.$store.state.vessel.activeVessel.vesselName;
        return {
            fish
        };

    }
});

</script>

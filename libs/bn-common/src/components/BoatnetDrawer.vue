<template>
    <q-layout  >
        <q-drawer
            v-model="show"
            :side="side"
            bordered
            :width="640"
            content-class="bg-grey-3"
            overlay
        >


        <template v-slot:default>
        <q-icon class="q-ma-md" name="clear" @click="toggleShow"></q-icon>
            <slot name="main"/>
        </template>
        </q-drawer>
    </q-layout>
</template>

<script lang="ts">
import { createComponent, ref, computed, onMounted } from '@vue/composition-api';

export default createComponent({
    props: {
        title: String,
        side: String,
        show: Boolean
    },
    setup(props, context) {

        const toggleShow = () => {
            context.emit('update:show', !props.show);
        };

        return {
            toggleShow
        };
    }
});
</script>

<style scoped>
</style>
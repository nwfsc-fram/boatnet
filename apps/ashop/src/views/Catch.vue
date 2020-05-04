<template>
    <q-page>
        <wcgop-catch v-if="appConfig.survey === 'wcgop'" ></wcgop-catch>
        <ashop-catch v-if="appConfig.survey === 'ashop'" ></ashop-catch>
    </q-page>
</template>

<script lang="ts">
import { createComponent, reactive, computed, ref } from '@vue/composition-api';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

import WcgopCatch from '../components/WcgopCatch.vue';
Vue.component('wcgop-catch', WcgopCatch);

import AshopCatch from '../components/AshopCatch.vue';
Vue.component('ashop-catch', AshopCatch);

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const appConfig = store.state.appSettings.appConfig;
    const router = context.root.$router;

    return {
        appConfig
    };
  }
});

</script>

<style scoped>
</style>
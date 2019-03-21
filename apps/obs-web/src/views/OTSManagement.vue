<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card>
            <q-card-section>
                OTS Management
            </q-card-section>
        </q-card>
        
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class OTSManagement extends Vue {

    constructor() {
        super();
    }
}
</script>

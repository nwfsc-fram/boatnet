<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card>
            <q-card-section>
                <input type="file" accept="image/*" capture>
            </q-card-section>
        </q-card>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class LogBookCapture extends Vue {
    
}
</script>
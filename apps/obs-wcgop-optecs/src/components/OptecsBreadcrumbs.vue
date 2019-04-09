<template>
  <q-btn-group class="q-gutter-xs">
    <q-btn class="btn-arrow-right" color="white" text-color="primary" label="Trips" icon="home" to="/" />
    <q-btn class="btn-arrow-right" color="white" text-color="primary" label="1" to="/tripdetails/1"/>
    <q-btn class="btn-arrow-right" color="white" text-color="primary" label="Hauls" to="/hauls"/>
    <q-btn class="btn-arrow-right" color="secondary" text-color="white" label="1" to="/hauldetails/1"/>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class OptecsBreadcrumbs extends Vue {}
</script>

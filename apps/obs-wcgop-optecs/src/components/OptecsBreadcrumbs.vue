<template>
  <q-breadcrumbs active-color="white" style="font-size: 16px" gutter="md">
    <q-space></q-space>
    <q-breadcrumbs-el label="Trips" icon="home" to="/" />
    <q-breadcrumbs-el label="1" to="/" />
    <q-breadcrumbs-el label="Hauls" to="/hauls" />
    <q-breadcrumbs-el label="1" to="/hauls" />
  </q-breadcrumbs>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class OptecsBreadcrumbs extends Vue {}
</script>

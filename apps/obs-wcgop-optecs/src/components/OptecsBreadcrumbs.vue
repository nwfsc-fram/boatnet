<template>
  <q-breadcrumbs active-color="white" style="font-size: 16px" gutter="md">
    <q-space></q-space>
    <q-breadcrumbs-el label="Trips" icon="home"/>
    <q-breadcrumbs-el label="Components" icon="widgets"/>
    <q-breadcrumbs-el label="Toolbar"/>
  </q-breadcrumbs>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class OptecsBreadcrumbs extends Vue {}
</script>

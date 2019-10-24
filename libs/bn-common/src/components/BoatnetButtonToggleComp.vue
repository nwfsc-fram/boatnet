<template>
  <div  class="q-px-md q-py-sm">
    <div>
      <b>{{config.title}}</b>
    </div>
      <q-btn-toggle v-model="valueHolder" toggle-color="primary" :options="config.options"/>
    <div>{{config.description}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class BoatnetButtonToggle extends Vue {
  @Prop() private config!: any;
  @Prop() private value!: any;

  get valueHolder() {
    return this.value;
  }
  set valueHolder(value: string) {
    this.$emit('update:value', value);
    this.$emit('save');
  }
}
</script>

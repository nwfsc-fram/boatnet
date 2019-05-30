<template>
  <div>
    <div>
      <b>{{title}}</b>
    </div>
    <q-btn-toggle v-model="valueHolder" toggle-color="primary" :options="options"/>
    <div>{{description}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class BoatnetButtonToggle extends Vue {
  @Prop() private title!: string;
  @Prop() private value!: any;
  @Prop() private options!: any;
  @Prop() private description!: string;

  get valueHolder() {
    return this.value;
  }
  set valueHolder(value: string) {
    this.$emit('update:value', value);
    this.$emit('save');
  }
}
</script>

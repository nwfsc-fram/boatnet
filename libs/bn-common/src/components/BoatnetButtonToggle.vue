<template>
  <div>
    <div>
      <b>{{title}}</b>
    </div>
    <template v-if="options.length < 7">
      <q-btn-toggle v-model="valueHolder" toggle-color="primary" :options="options"/>
    </template>
    <template v-else>
      <q-btn-toggle v-model="valueHolder" toggle-color="primary" :options="firstOptionsHolder"/>
      <q-btn-toggle v-model="valueHolder" toggle-color="primary" :options="secondOptionsHolder"/>
    </template>

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

  get firstOptionsHolder() {
    return this.options.slice(0, this.options.length / 2);
  }

  get secondOptionsHolder() {
    return this.options.slice(this.options.length / 2, this.options.length);
  }

  get valueHolder() {
    return this.value;
  }
  set valueHolder(value: string) {
    this.$emit('update:value', value);
    this.$emit('save');
  }
}
</script>

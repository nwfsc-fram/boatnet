<template>
  <div class="q-px-md q-py-sm">
    <div>
      <b>{{title}}</b>
    </div>
    <q-btn-toggle v-model="valueHolder" toggle-color="primary" :options="options" @input="save" />
    <div>{{description}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { get, set } from 'lodash';

@Component
export default class BoatnetButtonToggle extends Vue {
  @Prop() private title!: string;
  @Prop() private options!: any;
  @Prop() private description!: string;
  @Prop() private val!: string;

  get valueHolder() {
    return this.val;
  }
  set valueHolder(value: string) {
    this.$emit('update:val', value);
  }

  private save() {
    this.$emit('save');
  }
}
</script>

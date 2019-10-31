<template>
  <div class="q-px-md q-py-sm">
    <div>
      <b>{{config.title}}</b>
    </div>
    <q-btn-toggle
      v-model="valueHolder"
      toggle-color="primary"
      :options="config.options"
      @input="save"
    />
    <div>{{config.description}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { get, set } from 'lodash';

@Component
export default class BoatnetButtonToggle extends Vue {
  @Prop() private config!: any;
  @Prop() private model!: any;

  get valueHolder() {
    return get(this.model, this.config.modelName);
  }
  set valueHolder(value: string) {
    Vue.set(this.model, this.config.modelName, value);
    set(this.model, this.config.modelName, value);
  }

  private save() {
    this.$emit('save');
  }
}
</script>

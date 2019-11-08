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
    const modelName = this.config ? this.config.modelName : '';
    const model: any = this.model;
    const fields = modelName.split('.');

    if (fields.length > 1) {
      const newObjName = modelName.slice(modelName.indexOf('.') + 1);
      const newObj = set({}, newObjName, value);
      Vue.set(model, fields[0], newObj);
    } else {
      Vue.set(model, modelName, value);
    }
  }

  private save() {
    this.$emit('save');
  }
}
</script>

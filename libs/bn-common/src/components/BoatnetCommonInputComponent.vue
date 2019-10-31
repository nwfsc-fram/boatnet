<template>
  <div>
    <boatnet-datetime-prime
      v-if="config.type === 'dateTime'"
      :config="config"
      :model="model"
      @save="save"
    ></boatnet-datetime-prime>

    <boatnet-keyboard-select-list
      v-if="config.type === 'input'"
      :config="config"
      :model="model"
      @save="save"
    ></boatnet-keyboard-select-list>

    <boatnet-button-toggle-comp
      v-if="config.type === 'toggle'"
      :config="config"
      :model="model"
      @save="save"
    ></boatnet-button-toggle-comp>
  </div>
</template>

<script lang="ts">
import { createComponent } from '@vue/composition-api';

export default createComponent({
  props: {
    config: Object,
    model: Object
  },
  setup(props, context) {
    const save = () => {
      context.emit('save');
    };

    return {
      save
    };
  }
});
</script>

<template>
    <div>
        ASHOP catch screen
    </div>
</template>

<script lang="ts">
import { createComponent, reactive, computed, ref } from '@vue/composition-api';

export default createComponent({
  setup(props, context) {
    const store: any = context.root.$store;
    const router = context.root.$router;

    return {
    };
  }
});

</script>

<style scoped>
</style>
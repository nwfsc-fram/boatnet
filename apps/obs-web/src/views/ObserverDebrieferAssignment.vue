<template>
  <div>assign observer to debriefer</div>
</template>


<script lang="ts">
import { createComponent, ref, reactive } from '@vue/composition-api';
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Basket } from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

export default createComponent({
  setup(props, context) {
    return {};
  }
});
</script>
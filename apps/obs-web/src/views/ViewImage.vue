<template>
  <div class="q-pa-md q-gutter-md relative-position" style="min-height: 200px">
    <q-inner-loading :showing="transferring">
      <q-spinner-radio color="primary" size="3em" />
    </q-inner-loading>
    <div v-if="screenshots.length">
      <div v-for="s of screenshots" :key="s.name">
        <div>{{ s.name }}</div>
        <img :src="s.imgUrl" :width="s.width" />
      </div>
    </div>
    <div v-else>No images available</div>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, watch } from '@vue/composition-api';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService,
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import Vue, { WatchOptions } from 'vue';

export default createComponent({
  props: {
    ids: Array,
  },
  setup(props, context) {
    const transferring: any = ref(false);
    const screenshots: any = ref([]);

    const watcherOptions: WatchOptions = {
      immediate: true,
    };

    watch(() => props.ids, init, watcherOptions);
    init();

    async function init() {
      if (props.ids) {
        const idVals: any[] = props.ids ? props.ids : [];
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions = {
          reduce: false,
          include_docs: true,
          attachments: true,
          keys: idVals,
        };
        transferring.value = true;
        const response: any = await masterDB.listWithDocs(queryOptions);

        for (const row of response.rows) {
          for (const attachment of Object.keys(row._attachments)) {
            console.log(attachment);
            const filename = attachment;

            const byteCharacters = atob(row._attachments[filename].data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], {
              type: row._attachments[filename].content_type,
            });

            screenshots.value.push({
              name: filename,
              imgUrl: URL.createObjectURL(blob),
              width: document.body.clientWidth / 2,
            });
          }
        }
        transferring.value = false;
      }
    }

    return {
      transferring,
      screenshots,
    };
  },
});
</script>
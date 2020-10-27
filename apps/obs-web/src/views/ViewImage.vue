<template>
  <div class="q-pa-md q-gutter-md relative-position" style="min-height: 200px">
    <q-inner-loading :showing="transferring">
      <q-spinner-radio color="primary" size="3em" />
    </q-inner-loading>
    <div id="imagesholder"></div>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch,
} from '@vue/composition-api';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService,
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import Vue, { WatchOptions } from 'vue';

export default createComponent({
  props: {
    id: String,
  },
  setup(props, context) {
    const transferring: any = ref(false);

    const watcherOptions: WatchOptions = {
      immediate: true,
    };

    watch(() => props.id, init, watcherOptions);
    init();

    async function init() {
      if (props.id) {
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions = {
          reduce: false,
          include_docs: true,
          attachments: true,
          key: props.id,
        };
        transferring.value = true;
        const response: any = await masterDB.listWithDocs(queryOptions);

        for (const attachment of Object.keys(
          response.rows[0]._attachments
        )) {
          console.log(attachment);
          const filename = attachment;

          const byteCharacters = atob(
            response.rows[0]._attachments[filename].data
          );
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: response.rows[0]._attachments[filename].content_type,
          });

          const url = URL.createObjectURL(blob);
          const img = document.createElement('img');
          img.width = document.body.clientWidth / 2;
          img.src = url;

          const div = document.createElement('div');
          div.innerHTML = filename;

          document.getElementById('imagesholder')!.appendChild(div);
          document.getElementById('imagesholder')!.appendChild(img);
        }
        transferring.value = false;
      }
    }

    return {
      transferring
    };
  },
});
</script>
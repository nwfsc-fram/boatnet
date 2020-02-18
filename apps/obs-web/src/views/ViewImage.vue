<template>
    <div class="q-pa-md q-gutter-md">
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
  onServerPrefetch
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

export default createComponent({
    setup(props, context) {

        const id: any = ref(context.root.$route.query.id ? context.root.$route.query.id : 0);
        onMounted( async () => {
            if (id.value) {
                const masterDB: Client<any> = couchService.masterDB;
                const queryOptions = {
                    reduce: false,
                    include_docs: true,
                    attachments: true,
                    key: id.value
                };

                const response: any = await masterDB.view<any>(
                    'obs_web',
                    'ots_trips_with_logbook_captures',
                    queryOptions
                );

                response.rows[0].doc._attachments[Object.keys(response.rows[0].doc._attachments)[0]];
                const filename = Object.keys(response.rows[0].doc._attachments)[0];

                const byteCharacters = atob(response.rows[0].doc._attachments[filename].data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], {type: response.rows[0].doc._attachments[filename].content_type});

                const url = URL.createObjectURL(blob);
                const img = document.createElement('img');
                img.width = document.body.clientWidth / 2;
                img.src = url;

                document.getElementById('imagesholder')!.appendChild(img);
            }

        })

        return {
        }
    }
})
</script>
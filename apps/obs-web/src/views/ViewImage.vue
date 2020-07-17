<template>
    <div class="q-pa-md q-gutter-md relative-position" style="min-height: 200px">
            <q-inner-loading :showing="transferring">
                <q-spinner-radio color="primary" size="3em"/>
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
  onServerPrefetch
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

export default createComponent({
    setup(props, context) {

        const id: any = ref(context.root.$route.query.id ? context.root.$route.query.id : 0);
        const transferring: any = ref(false);
        onMounted( async () => {
            if (id.value) {
                const masterDB: Client<any> = couchService.masterDB;
                const queryOptions = {
                    reduce: false,
                    include_docs: true,
                    attachments: true,
                    key: id.value
                };
                transferring.value = true;
                const response: any = await masterDB.view<any>(
                    'obs_web',
                    'ots_trips_with_logbook_captures',
                    queryOptions
                );


                for (const attachment of Object.keys(response.rows[0].doc._attachments)) {
                    console.log(attachment);
                    const filename = attachment;

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

                    const div = document.createElement('div');
                    div.innerHTML = filename;

                    document.getElementById('imagesholder')!.appendChild(div);
                    document.getElementById('imagesholder')!.appendChild(img);
                }
                transferring.value = false;
            }

        });

        return {
            transferring
        };
    }
});
</script>
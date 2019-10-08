<template>

    <div class="q-pa-md  q-gutter-md">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clearAlert"/>
            </template>
        </q-banner>

        <label class="cameraButton shadow-2 bg-primary text-white">Capture Logbook Image
            <input @change="handleImage($event)" type="file" accept="image/*;capture=camera" capture>
        </label>

        <div>
            <img v-if="file" :src="fileUrl" style="width: 300px">
        </div>

        <q-btn v-if="file" color="primary" label="submit" @click="submitImage"></q-btn>


        <q-btn label="get images" @click="getImages"></q-btn>
        <div id="imagesholder"></div>

    </div>

</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TripState, PermitState, UserState, VesselState, AlertState } from '../_store/types/types';

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

import moment from 'moment';

@Component
export default class LogBookCapture extends Vue {
    @State('trip') private trip!: TripState;
    @State('permit') private permit!: PermitState;
    @State('user') private user!: UserState;
    @State('vessel') private vessel!: VesselState;

    @State('alert') private alert!: AlertState;
    @Action('error', { namespace: 'alert' }) private errorAlert: any;
    @Action('clear', { namespace: 'alert' }) private clearAlert: any;

    private file: any = null;
    private fileUrl: any = null;

    private dbImage: any = null;
    private dbImageUrl: any = null;

    private handleImage(event: any) {
        this.file = event!.target!.files[0];
        this.fileUrl = URL.createObjectURL(this.file);
        console.log(this.file);
    }

    private submitImage() {

        const fileName = this.file.name + ' - ' + authService.getCurrentUser()!.username + ' - ' + moment().format();

        const newImage = {
            createdBy: authService.getCurrentUser()!.username ? authService.getCurrentUser()!.username : undefined,
            createdDate: moment().format(),
            type: 'logbook-capture',
            _attachments: {
                [fileName] : {
                    content_type: this.file.type,
                    data: this.file
                }
            }
        };

        pouchService.db.post(pouchService.userDBName, newImage);

    }

    private async getImages() {
        const docs = await pouchService.db.allDocs(pouchService.userDBName, {attachments: true} );
        for (const row of docs.rows) {
            if (row.doc.type === 'logbook-capture') {
                const filename = Object.keys(row.doc._attachments)[0];
                console.log(row.doc._attachments[filename].data);

                const byteCharacters = atob(row.doc._attachments[filename].data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], {type: row.doc._attachments[filename].content_type});

                // this.dbImage = blob;
                // this.dbImageUrl = URL.createObjectURL(blob);

                const url = URL.createObjectURL(blob);
                const img = document.createElement('img');
                img.width = 300;
                img.src = url;

                document.getElementById('imagesholder')!.appendChild(img);

                // this.dbImageUrl = URL.createObjectURL(this.dbImage);
            }
        }
    }

}
</script>

<style scoped>

label.cameraButton {
  display: inline-block;
  margin: 1em;
  padding: 0.5em;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
}

label.cameraButton input[accept*="camera"] {
  display: none;
}

</style>
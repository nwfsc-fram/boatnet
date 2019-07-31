<template>
  <q-page padding>
    <!-- <div class='text-h6 text-primary' >About</div>
    <q-btn label='runApexUserQuery' @click='hitApi'></q-btn>
    <q-btn label='get users' @click='getUsers'></q-btn>
    <q-btn label='get roles' @click='getRoles'></q-btn>

    <q-input label='role name' v-model='roleName'></q-input>
    <q-btn label='add role' @click='addRole'></q-btn>
    <q-btn label='delete role' @click='deleteRole'></q-btn>
    <q-btn label='add user' @click='addUser'></q-btn> -->


    <q-btn label="get doc types" @click="getDocTypes"></q-btn>
    <br><br>

    <div class="row" style="">
      <div class="col" style="border: 2px solid blue; border-radius: 10px; padding: 4px; margin: 4px">
        <div class="text-h6">DOC TYPES:</div>
        <q-list separator dense>
          <q-item v-for="docType of docTypes" :key="docType" @click.native="getDocs(docType)">
            {{ docType }}
          </q-item>
        </q-list>
      </div>

      <div class="col" style="border: 2px solid grey; border-radius: 10px; padding: 4px; ; margin: 4px">
        <div class="text-h6" style="text-transform: uppercase">{{ docType }} DOCS:</div>
        <q-list separator dense>
          <q-item v-for="doc of foundDocs" :key="doc._id">
            <div v-if="doc.doc.legacy && doc.doc.description">
              {{ doc.doc.legacy.lookupVal }} - {{ doc.doc.description }}
            </div>
            <div v-else>
              {{ doc.doc.description }}
            </div>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>


<script lang='ts'>

// import { mapState } from 'vuex';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UsState, UsStateTypeName } from '@boatnet/bn-models';

import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import axios from 'axios';

@Component
export default class About extends Vue {
  private token: any;
  private users: any[] = [];
  private roleName: any = '';
  private docTypes: any[] = [];
  private loading: boolean = false;
  private foundDocs: any[] = [];
  private docType: string = '';

  @State('alert') private alert!: AlertState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  private hitApi() {
    axios.post('https://localhost:9000/api/v1/login', {
        'username': authService.getCurrentUser()!.username,
        'password': authService.getCurrentUser()!.hashedPW,
        'applicationName': 'OBSERVER_BOATNET'
    })
        .then( (response) => {
            this.token = response.data.token;
            console.log(this.token);
        });
  }

  private getUsers() {
    axios.get('https://localhost:9000/api/v1/users', {
      params: {'token': this.token}
    })
  .then((response) => {
    this.users = response.data.users;
    console.log(response.data.users);
  })
  }

  private getRoles() {
    axios.get('https://localhost:9000/api/v1/user-role', {
      params: {
        'username': this.users[0],
        'token': this.token
        }
    })
    .then((response) => {
      console.log(response.data.roles);
    })
  }

  private addRole() {
    axios.post('https://localhost:9000/api/v1/user-role', {
      'token': this.token,
      'username': this.users[0],
      'role': this.roleName
    })
    .then((response) => {
      console.log(response.data);
    })
  }

    private deleteRole() {
    const headers: any = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
      }

    const data: any = {
        'username': this.users[0],
        'role': this.roleName
    }

    const params: any = {
      'token': this.token
    }

    axios.delete('https://localhost:9000/api/v1/user-role', {data, headers, params})
    .then((response) => {
      console.log(response);
    });
  }

  private addUser() {
    axios.post('https://localhost:9000/api/v1/user', {
      'username': 'jane.doe',
      'lastName': 'Doe',
      'firstName': 'Janet',
      'emailAddress': 'bad@address.xyz123',
      'comment': 'This is an example user.',
      'token': this.token
      })
    .then((response) => {
      console.log(response);
    });
  }

  private async getDocTypes() {
    this.docTypes = [];
    this.docType = '';
    const masterDB: Client<any> = couchService.masterDB;
    try {
        this.loading = true;
        const queryOptions: any = {
          include_docs: false,
          reduce: true,
          group_level: 1
        };

        const docTypes = await masterDB.view<any>(
            'obs-web',
            'all_doc_types',
            queryOptions
            );

        for (const docType of docTypes.rows) {
          if (docType.key) {
            this.docTypes.push(docType.key)
          }
        }
        this.loading = false;

    } catch (err) {
        this.error(err);

    }

  }

  private async getDocs(docType: any) {
    this.foundDocs = [];
    this.docType = docType;
    console.log(docType);
    const masterDB: Client<any> = couchService.masterDB;
    const queryOptions: any = {
      include_docs: true,
      reduce: false,
      key: docType
    }

    const docTypeDocs = await masterDB.view<any>(
      'obs-web',
      'all_doc_types',
      queryOptions
    )
    console.log(docTypeDocs);
    for (const row of docTypeDocs.rows) {
      console.log(row);
      const doc: any = row.key
      this.foundDocs.push(row);
    }

  }

  private created() {
    console.log(authService.getCurrentUser());
  }

  constructor() {
    super();
  }

}

</script>

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
      <div v-if="docTypes.length > 0" class="col3" style="border: 2px solid blue; border-radius: 10px; padding: 4px; margin: 4px">
          <div class="text-h6" style="padding: 0 15px; color: blue">DOC TYPES:</div>
        <q-scroll-area style="height: 650px; width: 200px">
          <q-list separator dense>
            <q-item v-for="docType of docTypes" :key="docType" @click.native="getDocs(docType)">
              {{ docType }}
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-btn class="vertical-bottom" label="add" color="red" style="float: right; margin: 15px" @click="createNewLookupType"></q-btn>
      </div>

      <div v-if="foundDocs.length > 0" class="col3" style="border: 2px solid grey; border-radius: 10px; padding: 4px; ; margin: 4px">
          <div class="text-h6" style="padding: 0 15px; text-transform: uppercase; color: grey">{{ docType }} DOCS:</div>
        <q-scroll-area style="height: 650px; width: 250px">
          <q-list separator dense>
            <q-item v-for="doc of foundDocs" :key="doc._id" @click.native="selectDoc(doc.doc)">
              <div v-if="doc.doc.legacy && doc.doc.description">
                {{ doc.doc.legacy.lookupVal }} - {{ doc.doc.description }}
              </div>
              <div v-else>
                {{ doc.doc.description }}
              </div>
              <div v-if="'isActive' in doc.doc && !doc.doc.isActive" style="margin-left: 25px; position: relative; top: 0; right: 0; background-color: grey; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em">INACTIVE</div>
              <div v-else style="margin-left: 25px; position: relative; top: 0; right: 0; background-color: teal; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em">ACTIVE</div>
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-btn class="vertical-bottom" label="add" color="red" style="float: right; margin: 15px" @click="getNewLookupVal"></q-btn>
      </div>

      <div v-if="selectedDoc" class="col6" style="border: 2px solid green; border-radius: 10px; padding: 4px; ; margin: 4px; max-width: 550px">
        <div class="text-h6" style="padding: 0 15px; color: green">DOC DETAILS:</div>
        <q-list v-if="selectedDoc" separator dense>
          <q-item v-for="key of Object.keys(selectedDoc)" :key="key">
            <span v-if="key !== 'legacy'">
            {{ key }} : {{ selectedDoc[key] }}
            </span>
            <span v-if="key === 'legacy'">
              <b>Legacy:</b>
            <div v-for="subKey of Object.keys(selectedDoc[key])" :key="subKey" style="margin-left: 15px">
              {{ subKey }} : {{ selectedDoc[key][subKey] }}
            </div>

            </span>
          </q-item>
        </q-list>
        <q-btn class="vertical-bottom" label="delete" color="red" style="float: right; margin: 15px 15px 15px 0" @click="deleteConfirm = true"></q-btn>
        <q-btn class="vertical-bottom" label="edit" color="blue" style="float: right; margin: 15px 15px" @click="editLookup = true"></q-btn>
        <q-btn v-if="'isActive' in selectedDoc && !selectedDoc.isActive" class="vertical-bottom" label="set active" color="red" style="float: right; margin: 15px 0" @click="setActive"></q-btn>
        <q-btn v-else class="vertical-bottom" label="set inactive" color="blue" style="float: right; margin: 15px 0" @click="setInactive"></q-btn>
      </div>
    </div>

    <q-dialog v-model="newLookup">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="text-transform: uppercase">new {{ docType }} lookup</div>
          <div v-if="newDocType">
            <q-input v-model="docType" label="New Lookup Type"></q-input>
          </div>
          <q-input v-model="lookupModel.lookupVal" label="Lookup Val"></q-input>
          <q-input v-model="lookupModel.description" label="Description"></q-input>
          <q-btn label="add" color="red" style="float: right; margin: 15px" @click="createDoc"></q-btn>
          <q-btn label="cancel" color="blue" style="float: right; margin: 15px 0" @click="newLookup = false"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editLookup">
      <q-card v-if="selectedDoc">
        <q-card-section>
          <div class="text-h6" style="text-transform: uppercase">edit lookup: {{ selectedDoc.legacy.lookupVal }}</div>

            <div class="row">

              <div class="col" style="margin: 10px">
                <div v-for="key of Object.keys(selectedDoc)" :key="key">
                  <span v-if="key === '_id' || key === '_rev'">
                    <b>{{ key.substring(1, 4) }} : {{ selectedDoc[key].substring(0, 12) }}... </b>
                  </span>
                  <span v-else-if="key === 'createdBy' || key === 'createdDate' || key === 'updatedDate' || key === 'updatedBy'">
                    <sub>
                      {{ key }} : {{ selectedDoc[key] }}
                    </sub>
                  </span>
                  <span v-else-if="key === 'isActive'">
                    <q-toggle v-model="selectedDoc[key]" :label="key"></q-toggle>
                  </span>
                  <span v-else>
                    <q-input v-if="key !== 'legacy'" v-model="selectedDoc[key]" :label="key"></q-input>
                  </span>
                </div>
              </div>

              <div class="col" style="margin: 10px">
                <b>Legacy:</b>
                <div v-for="key of Object.keys(selectedDoc)" :key="key + 2">
                  <span v-if="key === 'legacy'">
                    <span v-for="subKey of Object.keys(selectedDoc[key])" :key="subKey">
                      <q-input v-model=selectedDoc[key][subKey] :label="subKey"></q-input>
                    </span>
                  </span>
                </div>
              </div>

            </div>

            <div>
              <q-input v-model="newFieldName" label="New Field" ></q-input>
              <q-btn color="primary" label="Add Field" @click="addField"></q-btn>
            </div>

          <q-btn label="update" color="red" style="float: right; margin: 15px" @click="updateDoc"></q-btn>
          <q-btn label="cancel" color="blue" style="float: right; margin: 15px 0" @click="editLookup = false"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteConfirm">
      <q-card v-if="selectedDoc">
        <q-card-section>
          <div class="text-h6">Are you sure you want to delete</div>
          <div>{{ selectedDoc.legacy.lookupVal }} - {{ selectedDoc.description }} </div>

          <q-btn label="delete" color="red" style="float: right; margin: 15px" @click="deleteDoc"></q-btn>
          <q-btn label="cancel" color="blue" style="float: right; margin: 15px 0" @click="deleteConfirm = false"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

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
  @State('alert') private alert!: AlertState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  private token: any;
  private users: any[] = [];
  private roleName: any = '';
  private docTypes: any[] = [];
  private loading: boolean = false;
  private foundDocs: any[] = [];
  private docType: string = '';
  private selectedDoc: any = null;
  private lookupModel: any = {lookupVal: '', description: ''};
  private newLookup: boolean = false;
  private editLookup: boolean = false;
  private deleteConfirm: boolean = false;
  private newDocType: boolean = false;
  private newFieldName: string = '';

  constructor() {
    super();
  }

  private hitApi() {
    axios.post('https://localhost:9000/api/v1/login', {
        username: authService.getCurrentUser()!.username,
        password: authService.getCurrentUser()!.hashedPW,
        applicationName: 'OBSERVER_BOATNET'
    })
        .then( (response) => {
            this.token = response.data.token;
            console.log(this.token);
        });
  }

  private getUsers() {
    axios.get('https://localhost:9000/api/v1/users', {
      params: {token: this.token}
    })
  .then((response) => {
    this.users = response.data.users;
    console.log(response.data.users);
  });
  }

  private getRoles() {
    axios.get('https://localhost:9000/api/v1/user-role', {
      params: {
        username: this.users[0],
        token: this.token
        }
    })
    .then((response) => {
      console.log(response.data.roles);
    });
  }

  private addRole() {
    axios.post('https://localhost:9000/api/v1/user-role', {
      token: this.token,
      username: this.users[0],
      role: this.roleName
    })
    .then((response) => {
      console.log(response.data);
    });
  }

    private deleteRole() {
    const headers: any = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
      };

    const data: any = {
        username: this.users[0],
        role: this.roleName
    };

    const params: any = {
      token: this.token
    };

    axios.delete('https://localhost:9000/api/v1/user-role', {data, headers, params})
    .then((response) => {
      console.log(response);
    });
  }

  private addUser() {
    axios.post('https://localhost:9000/api/v1/user', {
      username: 'jane.doe',
      lastName: 'Doe',
      firstName: 'Janet',
      emailAddress: 'bad@address.xyz123',
      comment: 'This is an example user.',
      token: this.token
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
            this.docTypes.push(docType.key);
          }
        }
        this.loading = false;

    } catch (err) {
        this.error(err);

    }

  }

  private async getDocs(docType: any) {
    this.selectDoc(null);
    this.foundDocs = [];
    this.docType = docType;
    this.newDocType = false;
    const masterDB: Client<any> = couchService.masterDB;
    const queryOptions: any = {
      include_docs: true,
      reduce: false,
      key: docType
    };

    const docTypeDocs = await masterDB.view<any>(
      'obs-web',
      'all_doc_types',
      queryOptions
    );
    for (const row of docTypeDocs.rows) {
      const doc: any = row.key;
      this.foundDocs.push(row);
    }

  }

  private selectDoc(doc: any) {
    this.selectedDoc = doc;
  }

  private async createDoc() {
    const masterDB: Client<any> = couchService.masterDB;
    this.lookupModel.legacy = {lookupVal: this.lookupModel.lookupVal};
    this.lookupModel.createdBy = authService.getCurrentUser()!.username;
    this.lookupModel.createdDate = moment().format();
    this.lookupModel.type = this.docType;

    try {
      const updateDoc = await masterDB.post(
        this.lookupModel
      );
      this.getDocs(this.docType);
      this.newLookup = false;
      this.newDocType = false;
      this.lookupModel = {lookupVal: '', description: ''};
      this.getDocTypes();
    } catch (err) {
      this.error(err);
    }

  }

  private async updateDoc() {
    this.selectedDoc.updatedDate = moment().format();
    this.selectedDoc.updatedBy = authService.getCurrentUser()!.username;
    const masterDB: Client<any> = couchService.masterDB;
    try {
      const updateDoc = await masterDB.put(
        this.selectedDoc._id,
        this.selectedDoc,
        this.selectedDoc._rev
      ).then((response) => {
        this.selectedDoc._rev = response.rev;
      });
      this.getDocs(this.docType);
      this.editLookup = false;
    } catch (err) {
      this.error(err);
    }
  }

  private setActive() {
    this.selectedDoc.isActive = true;
    this.updateDoc();
  }

  private setInactive() {
    this.selectedDoc.isActive = false;
    this.updateDoc();
  }

  private async deleteDoc() {
    const masterDB: Client<any> = couchService.masterDB;
    try {
      const deleteDoc = await masterDB.delete(
        this.selectedDoc._id,
        this.selectedDoc._rev
      );
      this.getDocs(this.docType);
      this.deleteConfirm = false;
    } catch (err) {
      this.error(err);
    }
  }

  private getNewLookupVal() {

    let newVal = 0;
    for (const lookup of this.foundDocs) {

      if (lookup.doc.legacy && lookup.doc.legacy.lookupVal) {
        if (parseInt(lookup.doc.legacy.lookupVal, 10) > newVal) {
          newVal = parseInt(lookup.doc.legacy.lookupVal, 10);
        }
      }
    }
    newVal += 1;
    Vue.set(this.lookupModel, 'lookupVal', newVal);
    this.newLookup = true;
  }

  private createNewLookupType() {
    this.foundDocs = [];
    this.selectedDoc = null;
    this.docType = '';
    this.newDocType = true;
    this.getNewLookupVal();
  }

  private addField() {
    Vue.set(this.selectedDoc, this.newFieldName, '');
    this.newFieldName = '';
  }

  private created() {
    if (!authService.getCurrentUser()) {
      this.$router.push({path: '/login'});
    } else {
      console.log(authService.getCurrentUser());
    }
  }



}

</script>

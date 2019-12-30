<template>
  <q-page padding>


    <q-btn label="get lookups" color="primary" @click="getDocTypes"></q-btn>
    <br><br>

    <div class="row">
      <div v-if="docTypes.length > 0" class="col3" style="padding: 4px; margin: 4px">
          <div class="text-h6" style="padding: 0 15px; color: black">LOOKUP TYPES:</div>
        <q-scroll-area style="height: 650px; width: 230px">
          <q-list separator dense>
            <q-item
              v-for="docType of docTypes.filter(
                  (docType) =>  {
                    return !['saved-selections', 'emefp', 'wcgop-trip',
                              'wcgop-operation', 'vessel', 'taxonomy',
                              'person', 'permit', 'ots-target', 'observer-activity',
                              'logbook-capture', 'catch-grouping', 'first-receiver',
                              'model-definition', 'trip-selection', 'trips-api', 'tally-record',
                              'ashop-cruise', 'ashop-haul', 'ashop-tribal-delivery', 'ashop-trip',
                              'nonFlowScaleReason', 'olevessel', 'trips-api', 'trips-api-catch',
                              'person-alias', 'vessel-permissions', 'tribal-delivery']
                              .includes(docType)
                    })"
              :key="docType"
              @click.native="docTypeSelection = docType"
              :active="docTypeSelection === docType"
              style="line-height: 2em"
            >
              {{ docType }}
            </q-item>
          </q-list>
        </q-scroll-area>
      </div>

      <div v-if="docsLoading && !filteredFoundDocs.length > 0" class="col6" style="padding: 4px; margin: 4px; font-weight: bold">
        <br>LOADING<br>
        <q-spinner color="primary" size="3em"></q-spinner>
      </div>
      <div v-if="filteredFoundDocs.length > 0" class="col6" style="padding: 4px; ; margin: 4px">
          <div class="text-h6" style="padding: 0 15px; text-transform: uppercase; color: black">{{ docType }} LOOKUPS:</div>
        <q-scroll-area style="height: 650px; width: 460px">
          <div v-if="docType === 'taxonomy-alias'">
            <q-input v-model="searchTerm" label="Search" dense @input="filterDocs"></q-input>
          </div>
          <q-list separator dense>
            <q-item
              v-for="row of filteredFoundDocs"
              :key="row._id"
              @click.native="docSelection = row.doc"
              :active="docSelection === row.doc"
              style="line-height: 2em"
            >
              <div v-if="row.doc.legacy && row.doc.description">{{ row.doc.legacy.lookupVal }} - {{ row.doc.description }}</div>
              <div v-else-if="row.doc.description">{{ row.doc.description }}</div>
              <div v-else-if="row.doc.survey">{{ row.doc.survey }} config</div>
              <div v-else-if="row.doc.alias">{{ row.doc.alias }}</div>
              <div v-else>{{ row.doc.name }}</div>

              <div v-if="row.doc.isAshop || row.doc.isCommon" style="margin-left: 7px; margin-top: 4px; background-color: red; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">ASHOP</div>
              <div v-if="row.doc.isWcgop || row.doc.isCommon" style="margin-left: 7px; margin-top: 4px; background-color: green; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">WCGOP</div>
              <div v-if="row.doc.isHakeSurvey || row.doc.isCommon" style="margin-left: 7px; margin-top: 4px; background-color: blue; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">HAKE</div>
              <div v-if="row.doc.isHookAndLineSurvey || row.doc.isCommon" style="margin-left: 7px; margin-top: 4px; background-color: purple; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">H + L</div>
              <div v-if="row.doc.isTrawlSurvey || row.doc.isCommon" style="margin-left: 7px; margin-top: 4px; background-color: orange; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">TRAWL</div>
              <div v-if="row.doc.isPacfin || row.doc.isCommon" style="margin-left: 7px; margin-top: 4px; background-color: black; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">PACFIN</div>

              <div v-if="'isActive' in row.doc && !row.doc.isActive" style="margin-left: 25px; position: absolute; top: 6px; right: 0; background-color: grey; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">INACTIVE</div>
              <div v-else style="margin-left: 25px; position: absolute; top: 6px; right: 0; background-color: teal; color: white; border-radius: 5px; padding: 4px; font-weight: bold; font-size: .7em; height: 2em; line-height: 1.5em">ACTIVE</div>
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-btn class="vertical-bottom" label="add" color="red" style="float: right; margin: 15px" @click="getNewLookupVal"></q-btn>
      </div>

      <div v-if="selectedDoc" class="col5" style="border: 2px solid #1675d1; padding: 4px; ; margin: 4px; max-width: 550px">
        <div class="text-h6" style="padding: 0 15px; color: black">{{ selectedDoc.type.toUpperCase() }} DOC DETAILS:</div>
        <q-list v-if="selectedDoc" separator dense>
          <q-item v-for="key of Object.keys(selectedDoc).filter( (key) => { return !['_id', '_rev', 'type', 'createdBy', 'createdDate', 'uploadedBy', 'uploadedDate', 'updatedBy', 'updatedDate'].includes(key)})" :key="key"  style="line-height: 2em">
            <span v-if="key !== 'legacy'">
              <span v-if="key === 'taxonomy'">
                taxonomy:<br>
                <span style="margin-left: 10px">level: {{ parseVal(selectedDoc, key).level }} </span><br>
                <span style="margin-left: 10px">scientificName: {{ parseVal(selectedDoc, key).scientificName }} </span>
              </span>
              <span v-else>
                {{ key }} : {{ parseVal(selectedDoc, key) }}
              </span>
            </span>
            <span v-if="key === 'legacy'">
              <b>Legacy:</b>
            <div v-for="subKey of Object.keys(selectedDoc[key])" :key="subKey" style="margin-left: 15px">
              {{ subKey }} : {{ parseVal(selectedDoc[key], subKey) }}
            </div>

            </span>
          </q-item>
        </q-list>
        <div style="margin-left: 15px">
          <q-btn class="vertical-bottom" label="delete" color="red" style="float: right; margin: 15px 15px 15px 0" @click="deleteConfirm = true"></q-btn>
          <q-btn class="vertical-bottom" label="edit" color="blue" style="float: right; margin: 15px 15px" @click="editLookup = true"></q-btn>
          <q-btn v-if="'isActive' in selectedDoc && !selectedDoc.isActive" class="vertical-bottom" label="set active" color="red" style="float: right; margin: 15px 0" @click="setActive"></q-btn>
          <q-btn v-else class="vertical-bottom" label="set inactive" color="blue" style="float: right; margin: 15px 0" @click="setInactive"></q-btn>
        </div>
      </div>
    </div>

    <q-dialog v-model="newLookup">
      <q-card>
        <q-card-section>
          <div class="text-h6" style="text-transform: uppercase">new {{ docType }} lookup</div>
          <div v-if="newDocType">
            <q-input v-model="docType" label="New Lookup Type"></q-input>
          </div>

          <div v-if="docTypeModel">
            <span v-for="attrib in Object.keys(docTypeModel).filter( (attrib) => { return !['_id', '_rev', 'type', 'modelName', 'legacy'].includes(attrib)} )" :key="attrib">

              <q-toggle v-if="docTypeModel[attrib] === 'boolean'" v-model="lookupModel[attrib]" :label="attrib"></q-toggle>
              <q-input v-if="docTypeModel[attrib] === 'string'" v-model="lookupModel[attrib]" :label="attrib" :type="docTypeModel[attrib]"></q-input>

              <q-select v-if="Array.isArray(docTypeModel[attrib])" v-model="lookupModel[attrib]" :label="attrib" :options="docTypeModel[attrib]"></q-select>

              <div v-if="Array.isArray(docTypeModel[attrib]) && addAttribute[attrib]">
                <div class="row">
                  <div class="col-4" v-for="subAttrib in Object.keys(docTypeModel[attrib][0])" :key="subAttrib">
                    <q-input v-if="docTypeModel[attrib][0][subAttrib] === 'string'" :label="subAttrib" v-model="lookupModel[attrib + subAttrib]" style="margin: 5px"></q-input>
                    <q-toggle v-if="docTypeModel[attrib][0][subAttrib] === 'boolean'" :label="subAttrib" v-model="lookupModel[attrib + subAttrib]"></q-toggle>
                    <q-select v-if="Array.isArray(docTypeModel[attrib][0][subAttrib])" :label="subAttrib" v-model="lookupModel[attrib + subAttrib]" :options="docTypeModel[attrib][0][subAttrib]"></q-select>
                  </div>
                    <q-btn color="primary" label="add"></q-btn>
                </div>
              </div>

              <q-field v-if="typeof docTypeModel[attrib] === 'object' && !Array.isArray(docTypeModel[attrib])" v-model="lookupModel[attrib]" :label="attrib + ' columns'">
                <template v-slot:append>
                  <q-icon name="add_circle"></q-icon>
                </template>
              </q-field>

            </span>
          </div>

          <q-btn label="add" color="red" style="float: right; margin: 15px" @click="createDoc"></q-btn>
          <q-btn label="cancel" color="blue" style="float: right; margin: 15px 0" @click="newLookup = false"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="editLookup">
      <q-card v-if="selectedDoc">
        <q-card-section>
          <div class="text-h6" style="text-transform: uppercase">
            edit: {{ selectedDoc.legacy ? ( selectedDoc.legacy.lookupVal ? selectedDoc.legacy.lookupVal : selectedDoc.name ) : ( selectedDoc.description ? selectedDoc.description : selectedDoc.name? selectedDoc.name : selectedDoc.alias ) }}
          </div>

            <div class="row" style="width: 400px">

              <div class="col" style="margin: 10px">
                <div v-for="key of Object.keys(docTypeModel)" :key="key">
                  <span v-if="key === '_id' || key === '_rev' || key === 'modelName'"></span>
                  <span v-else-if="key === 'taxonomy'">
                    taxonomy:<br>
                    <span style="margin-left: 10px">level: {{ parseVal(selectedDoc, key).level }} </span><br>
                    <span style="margin-left: 10px">scientificName: {{ parseVal(selectedDoc, key).scientificName }} </span>
                  </span>
                  <span v-else-if="key === 'type'">
                    <b>{{ key }}: {{ selectedDoc[key] }}</b>
                  </span>
                  <span v-else-if="key === 'createdBy' || key === 'createdDate' || key === 'updatedDate' || key === 'updatedBy' || key === 'uploadedDate' || key === 'uploadedBy'">
                    <sub>
                      {{ key }} : {{ parseVal(selectedDoc, key) }}
                    </sub>
                  </span>
                  <span v-else>
                    <q-toggle v-if="docTypeModel[key] === 'boolean'" v-model="selectedDoc[key]" :label="key"></q-toggle>
                    <q-input v-else-if="key !== 'legacy' && !Array.isArray(docTypeModel[key])" v-model="selectedDoc[key]" :label="key"></q-input>
                    <q-select v-else-if="key !== 'legacy' && Array.isArray(docTypeModel[key])" v-model="selectedDoc[key]" :label="key" :options="docTypeModel[key]"></q-select>
                  </span>
                </div>
              </div>

              <div v-if="selectedDoc.legacy" class="col" style="margin: 10px">
                <b>Legacy:</b>
                <div v-for="key of Object.keys(selectedDoc)" :key="key + 2">
                  <span v-if="key === 'legacy'">
                    <span v-for="subKey of Object.keys(selectedDoc[key])" :key="subKey">
                      <div style="margin-left: 10px">{{ subKey }}: {{ selectedDoc[key][subKey] }}</div>
                    </span>
                  </span>
                </div>
              </div>

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
          <div>{{ selectedDoc.legacy ? selectedDoc.legacy.lookupVal + ' - ' : "" }}{{ selectedDoc.description }}{{ selectedDoc.name }} </div>

          <q-btn label="delete" color="red" style="float: right; margin: 15px" @click="deleteDoc"></q-btn>
          <q-btn label="cancel" color="blue" style="float: right; margin: 15px 0" @click="deleteConfirm = false"></q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>

  </q-page>
</template>


<script lang='ts'>

import { State, Action, Getter, Mutation } from 'vuex-class';
import { AlertState } from '../_store/types/types';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { WcgopTrip, BeaufortTypeName } from '@boatnet/bn-models';

import { AuthState, authService } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';
import axios from 'axios';

import { Beaufort } from '@boatnet/bn-models';

import OrderList from 'primevue/orderlist';
Vue.component('pOrderedList', OrderList);

import Menu from 'primevue/menu';
Vue.component('pMenu', Menu);

@Component
export default class LookupEditor extends Vue {
  @State('alert') private alert!: AlertState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  private token: any;
  private users: any[] = [];
  private roleName: any = '';
  private docTypes: any[] = [];
  private loading: boolean = false;
  private foundDocs: any[] = [];
  private filteredFoundDocs: any[] = [];
  private docType: string = '';
  private selectedDoc: any = null;
  private lookupModel: any = {lookupVal: ''};
  private newLookup: boolean = false;
  private editLookup: boolean = false;
  private deleteConfirm: boolean = false;
  private newDocType: boolean = false;
  private newFieldName: string = '';
  private docTypeModel: any = {};
  private addAttribute: any = {tripAttributes: false, haulAttributes: false};
  private docTypeSelection: any[] = [];
  private docSelection: any[] = [];
  private models: any = {};
  private searchTerm: string = '';
  private docsLoading = false;

  constructor() {
    super();
  }

  private get labels() {
    return this.docTypes.map( (docType) => {
      return {label: docType};
      });
  }

  private parseVal(selectedDoc: any, key: any) {
    if (['createdDate', 'updatedDate'].includes(key)) {
      return moment(selectedDoc[key]).format('MMM DD, YYYY h:m A');
    } else {
      return selectedDoc[key];
    }
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
            'obs_web',
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
    this.docsLoading = true;
    this.selectDoc(null);
    this.foundDocs = [];
    this.docType = docType;
    this.newDocType = false;
    const masterDB: Client<any> = couchService.masterDB;
    const lookupsDB: Client<any> = couchService.lookupsDB;
    const queryOptions: any = {
      include_docs: true,
      reduce: false,
      key: docType
    };

    const docTypeDocs = await masterDB.view<any>(
      'obs_web',
      'all_doc_types',
      queryOptions
    );

    this.docsLoading = false;

    this.docTypeModel = this.models[docType];

    for (const row of docTypeDocs.rows) {
      const doc: any = row.key;
      this.foundDocs.push(row);
    }

    function sortWord(a: any, b: any) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    }

    this.foundDocs.sort( (a: any, b: any) => {
      if (a.doc.legacy && a.doc.legacy.lookupVal) {
        if (parseInt(a.doc.legacy.lookupVal, 10) > parseInt(b.doc.legacy.lookupVal, 10)) {
          return 1;
        } else if (parseInt(a.doc.legacy.lookupVal, 10) < parseInt(b.doc.legacy.lookupVal, 10)) {
          return -1;
        } else {
          return 0;
        }
      } else if (a.doc.description) {
        return sortWord(a.doc.description, b.doc.description);
      } else if (a.doc.survey) {
        return sortWord(a.doc.survey, b.doc.survey);
      } else if (a.doc.alias) {
        return sortWord(a.doc.alias, b.doc.alias);
      } else {
        return sortWord(a.doc.name, b.doc.name);
      }
    });
  }

  private async getDocModels() {
    const lookupsDB: Client<any> = couchService.lookupsDB;
    const queryOptions: any = {
      include_docs: true,
      reduce: false,
      key: 'model-definition'
    };

    try {
      const models: any = await lookupsDB.view<any>(
        'obs_web',
        'all_doc_types',
        queryOptions
      );

      this.models = {};

      for (const row of models.rows) {
          this.models[row.doc.modelName] = row.doc;
      }

    } catch (err) {
      console.log(err);
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
      this.lookupModel = {lookupVal: ''};
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

  private filterDocs() {
    this.filteredFoundDocs = [];
    if (this.searchTerm === '') {
        this.filteredFoundDocs = this.foundDocs.slice(0, 50);
    } else {
      this.filteredFoundDocs = this.foundDocs.filter(
        (doc) => doc.doc.alias.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1
      );
    }

    function sortWord(a: any, b: any) {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    }

    this.filteredFoundDocs.sort( (a: any, b: any) => {
      if (a.doc.legacy && a.doc.legacy.lookupVal) {
        if (parseInt(a.doc.legacy.lookupVal, 10) > parseInt(b.doc.legacy.lookupVal, 10)) {
          return 1;
        } else if (parseInt(a.doc.legacy.lookupVal, 10) < parseInt(b.doc.legacy.lookupVal, 10)) {
          return -1;
        } else {
          return 0;
        }
      } else if (a.doc.description) {
        return sortWord(a.doc.description, b.doc.description);
      } else if (a.doc.survey) {
        return sortWord(a.doc.survey, b.doc.survey);
      } else if (a.doc.alias) {
        return sortWord(a.doc.alias, b.doc.alias);
      } else {
        return sortWord(a.doc.name, b.doc.name);
      }
    });
}

  private async created() {
    if (!authService.getCurrentUser()) {
      this.$router.push({path: '/login'});
    } else {
      console.log(authService.getCurrentUser());
    }
    this.getDocTypes();
    this.getDocModels();
  }

  @Watch('docTypeSelection')
  private handler1(newVal: string, oldVal: string) {
    console.log('handler1', newVal, oldVal);
    this.getDocs(newVal);
  }

  @Watch('docSelection')
  private handler2(newVal: string, oldVal: string) {
    console.log('handler2', newVal, oldVal);
    this.selectDoc(newVal);
  }

  @Watch('foundDocs')
  private handler3(newVal: string, oldVal: string) {
    if (this.foundDocs.length < 50) {
      this.filteredFoundDocs = this.foundDocs;
    } else {
      this.filteredFoundDocs = this.foundDocs.slice(0, 50);
    }
  }

}

</script>

<style scoped>
  .q-item--active {
    background-color: #1675d1;
    color: white;
  }
</style>
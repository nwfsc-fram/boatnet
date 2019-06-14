<template>
  <div>
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clear"/>
      </template>
    </q-banner>

    <q-card bordered>
      <q-card-section>
        <q-list>
          <q-item v-if="ots.newTarget">
            <q-item-section>
            <q-select
            v-model="ots.activeOTSTarget.fishery"
            dense
            label="Fishery"
            stack-label
            :options="fisheries"
            ></q-select>

            <q-select
            v-model="ots.activeOTSTarget.targetType"
            dense
            label="Target Type"
            stack-label
            :options="targetTypes"
            ></q-select>
            </q-item-section>
          </q-item>

          <q-item v-else class="text-h6 text-primary">
            <q-item-section>
            <strong>
              {{ ots.activeOTSTarget.fishery }} :
              {{ ots.activeOTSTarget.targetType }} Target
              <span
                v-if="ots.activeOTSTarget.targetType === 'Vessel' && ots.activeOTSTarget.targetVessel"
              >: {{ ots.activeOTSTarget.targetVessel.vesselName }}  ( {{ ots.activeOTSTarget.targetVessel.coastGuardNumber ? ots.activeOTSTarget.targetVessel.coastGuardNumber : ots.activeOTSTarget.targetVessel.stateRegulationNumber }} )</span>
              <span
                v-if="ots.activeOTSTarget.targetType === 'Port Group'"
              >: {{ ots.activeOTSTarget.targetPortGroup }}</span>
            </strong>
            </q-item-section>
          </q-item>


          <q-item v-if="ots.activeOTSTarget.targetType === 'Vessel'">
            <q-item-section>
            <q-select
            v-model="ots.activeOTSTarget.targetVessel"
            label="Target Vessel"
            :options="vessels"
            @filter="filterVessels"
            :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
            option-value="_id"
            stack-label
            use-input
            fill-input
            hide-selected
            dense
            >
            </q-select>
            </q-item-section>
          </q-item>

          <q-item v-if="ots.activeOTSTarget.targetType === 'Port Group'">
            <q-item-section>
            <q-select
            v-model="ots.activeOTSTarget.targetPortGroup"
            dense
            label="Target Port Group"
            stack-label
            option-label="portGroup"
            option-value="_id"
            use-input
            :options="portGroups">
            </q-select>
            </q-item-section>
          </q-item>

            <q-item>
              <q-item-section>
              <q-item-label><strong>Coverage Goal<br><br></strong></q-item-label>
                <q-slider
                v-model="ots.activeOTSTarget.coverageGoal"
                :min="0"
                :max="100"
                label-always
                >
                </q-slider>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <q-item-label><strong>Set Rate<br><br></strong></q-item-label>
                <q-slider
                v-model="ots.activeOTSTarget.setRate"
                :min="0"
                :max="100"
                label-always
                color="green"
                >
                </q-slider>
              </q-item-section>
            </q-item>

          <div class="row items-start">

              <q-item>
                <q-item-section>

                  <div class="text-subtitle2" >Effective Date</div>
                  <q-date
                      v-model="effectiveDate"
                      :options="optionsFn"
                      color="green"
                      dark
                      >
                  </q-date>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <div class="text-subtitle2">Expiration Date</div>
                  <q-date
                      v-model="expirationDate"
                      color="red"
                      dark
                      :options="expirationDateOptionsFn"
                      >
                  </q-date>
                  </q-item-section>
              </q-item>
          </div>

          </q-list>

<br>
      <q-card-actions>
          <q-btn color="red" label="Cancel" icon="warning" to="/ots-management" exact/>
          <q-btn color="primary" @click="saveTarget">Save</q-btn>
          <q-btn v-if="this.ots.activeOTSTarget.status ==='Active'" color="red" label="Deactivate" icon-right="fa fa-minus-circle" @click="confirm = true"></q-btn>
          <q-btn v-if="this.ots.activeOTSTarget.status ==='Inactive'" color="primary" label="Reactivate" icon-right="fa fa-plus-circle" @click="saveTarget"></q-btn>
      </q-card-actions>

      </q-card-section>

      <q-card-section v-if="this.ots.activeOTSTarget.fishery === 'EM EFP' && !ots.newTarget">
        <q-table
        title="Affected Vessels"
        :data="affectedVessels"
        :columns="vesselColumns"
        dense
        row_key="_id"
        :pagination.sync="pagination"
        :hide-bottom="this.ots.activeOTSTarget.targetType === 'Vessel'"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
              <q-td key="coastGuardNumber" :props="props">{{ props.row.coastGuardNumber ? props.row.coastGuardNumber : props.row.stateRegulationNumber }}</q-td>
              <q-td key="vesselTrips" :props="props">{{ props.row.tripsTaken }}</q-td>
              <q-td key="selectedTrips" :props="props">{{ props.row.selectedTrips }}</q-td>
              <q-td key="coveredYTD" :props="props">{{ props.row.coveredYTD || 0 }}</q-td>
              <q-td key="vesselTripsLastYear" :props="props">{{ props.row.tripsTakenLastYear || 0 }}</q-td>
              <q-td key="selectedTripsLastYear" :props="props">{{ props.row.selectedTripsLastYear || 0 }}</q-td>
              <q-td key="coveredLastYear" :props="props">{{ props.row.coveredLastYear || 0 }}</q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>


      <q-card-section>
        <q-table
          title="Target History"
          :data="targetHistory"
          :columns="columns"
          dense
          row_key="_id"
          hide-bottom
          v-if="this.ots.newTarget === 'False'"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="coverageGoal" :props="props">{{ props.row.coverageGoal }}%</q-td>
              <q-td key="setRate" :props="props">{{ props.row.setRate }}%</q-td>
              <q-td key="effectiveDate" :props="props">{{ formatDate(props.row.effectiveDate) }}</q-td>
              <q-td key="expirationDate" :props="props">{{ formatDate(props.row.expirationDate) }}</q-td>
              <q-td key="changedBy" :props="props">{{ props.row.createdBy }}</q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="confirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">Are you sure you want to deactivate this OTS target?  (This may result in no target being set for the fishery/vessel/port group)</div>
          <div style="float: right">
            <q-btn color="primary" size="md" @click="confirm = false">Cancel</q-btn>
            &nbsp;
            <q-btn color="red" size="md"  @click="deactivateTarget">Yes, I'm sure</q-btn>

          </div>
          <br><br>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import date from 'quasar';
import {
  GeneralState,
  PermitState,
  OTSState
} from '../_store/types/types';
import { OTSTarget, Vessel, WcgopTrip, EmEfp } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AlertState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

@Component
export default class OtsTargetDetail extends Vue {
  @State('ots') private ots!: OTSState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private fisheries = [];
  private targetTypes = [];

  private vessels: any[] = [];
  private portGroups = ['TO DO - Populate DB with Port Groups'];

  private confirm = false;
  private pagination = {rowsPerPage: 10};

  private columns =
  [
    { name: 'coverageGoal', label: 'Coverage Goal', field: 'coverageGoal', required: true, align: 'left', sortable: true },
    { name: 'setRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left', sortable: true },
    { name: 'effectiveDate', label: 'Effective Date', field: 'effectiveDate', required: true, align: 'left', sortable: true },
    { name: 'expirationDate', label: 'Expiration Date', field: 'expirationDate', required: true, align: 'left', sortable: true },
    { name: 'changedBy', label: 'Changed By', field: 'changedBy', required: true, align: 'left', sortable: true }
  ];

  private vesselColumns = [
    { name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true },
    { name: 'coastGuardNumber', label: 'Vessel Id', field: 'coastGuardNumber', required: true, align: 'left', sortable: true },
    { name: 'vesselTrips', label: 'Trips Taken', field: 'vesselTrips', required: true, align: 'left', sortable: true },
    { name: 'selectedTrips', label: 'Selected Trips', field: 'selectedTrips', required: true, align: 'left', sortable: true },
    { name: 'coveredYTD', label: 'Covered YTD (%)', field: 'coveredYTD', required: true, align: 'left', sortable: true },
    { name: 'vesselTripsLastYear', label: 'Trips Taken Last Year', field: 'vesselTripsLastYear', required: true, align: 'left', sortable: true },
    { name: 'selectedTripsLastYear', label: 'Selected Trips Last Year', field: 'selectedTripsLastYear', required: true, align: 'left', sortable: true },
    { name: 'coveredLastYear', label: 'Covered Last Year (%)', field: 'coveredLastYear', required: true, align: 'left', sortable: true },
  ];

  private otsTargetHistory: any[] = [];
  private emEfpTrips: WcgopTrip[] = [];
  private emEfpRoster: EmEfp[] = [];

  @Watch('ots.activeOTSTarget.targetType')
  private onChange(newVal: any, oldVal: any) {
    if (oldVal === 'Vessel' && this.ots.activeOTSTarget && this.ots.activeOTSTarget.targetVessel) {
      this.ots.activeOTSTarget.targetVessel = undefined;
    }
    if (oldVal === 'Port Group' && this.ots.activeOTSTarget && this.ots.activeOTSTarget.targetPortGroup) {
      this.ots.activeOTSTarget.targetPortGroup = undefined;
    }
  }

    private async getOptions() {
        try {
        // const masterDB: Client<any> = couchService.masterDB;
        const pouchDB = pouchService.db;
        const queryOptions: ListOptions = {
          limit: 100,
          start_key: '',
          inclusive_end: true,
          descending: false
        };

        const allFisheries = await pouchDB.query(
          pouchService.lookupsDBName,
          'obs_web/all_fisheries',
          queryOptions
        );
        this.fisheries = allFisheries.rows.map((row: any) => row.key);

        const otsTargetTypes = await pouchDB.query(
          pouchService.lookupsDBName,
          'obs_web/ots-target-types',
          queryOptions
        );
        this.targetTypes = otsTargetTypes.rows.map((row: any) => row.key);

        } catch (err) {
            this.error(err);
        }
    }

    // function to get ots target history
    private async getHistory() {
      const masterDB: Client<any> = couchService.masterDB;

      const history = await masterDB.viewWithDocs<any>(
        'sethtest',
        'all_ots_targets'
      );

      for (const row of history.rows) {
        const target = row.doc;
        this.otsTargetHistory.push(target);
      }
    }

    private async getEMEFP() {
      const masterDB: Client<any> = couchService.masterDB;

      const emefpTrips = await masterDB.viewWithDocs<any>(
        'sethtest',
        'em-efp-trips'
      );

      for (const row of emefpTrips.rows) {
        const trip = row.doc;
        this.emEfpTrips.push(trip);
      }

      const emefpRoster = await masterDB.viewWithDocs<any>(
        'sethtest',
        'all_em_efp'
      );

      for (const row of emefpRoster.rows) {
        const member = row.doc;
        this.emEfpRoster.push(member);
      }

    }

    private getStatus(row: any) {
        if ( (moment(row.efffectiveDate) <= moment() && moment() <= moment(row.expirationDate)) && ( row.status !== 'Inactive' )) {
            return 'Active';
        } else {
            return 'Inactive';
        }
    }

    private get affectedVessels() {
      const affectedVessels: any[] = [];
      const targetedVessels: any[] = [];

      if (this.ots.activeOTSTarget.targetType === 'Fishery Wide') {

        // build a list of em efp vessels that are selected only based on an EM EFP Fishery Wide target
        // for (const target of this.otsTargetHistory) {
        //   if (this.getStatus(target) === 'Active' && target.fishery === this.ots.activeOTSTarget.fishery && target.targetType === 'Vessel')  {
        //     targetedVessels.push( target.targetVessel.coastGuardNumber ? target.targetVessel.coastGuardNumber : target.targetVessel.stateRegulationNumber );
        //   }
        // }

        for (const member of this.emEfpRoster) {
          if (member.vessel) {
            const vesselID = member.vessel!.coastGuardNumber ? member.vessel!.coastGuardNumber : member.vessel!.stateRegulationNumber;
            if (targetedVessels.indexOf(vesselID) === -1) {
              affectedVessels.push(member.vessel);
            }
          }
        }
        for (const vessel of affectedVessels) {
          vessel.tripsTaken = this.getTripsTaken(vessel, moment().year());
          vessel.selectedTrips = this.getSelectedTrips(vessel, moment().year());
          vessel.tripsTakenLastYear = this.getTripsTaken(vessel, moment().subtract(1, 'years').year());
          vessel.selectedTripsLastYear = this.getSelectedTrips(vessel, moment().subtract(1, 'years').year());
          vessel.coveredYTD = Math.floor((vessel.selectedTrips / vessel.tripsTaken) * 100);
          vessel.coveredLastYear = Math.floor((vessel.selectedTripsLastYear / vessel.tripsTakenLastYear) * 100);
        }
        return affectedVessels;
      }

      if (this.ots.activeOTSTarget.targetType === 'Vessel') {

        const activeVesselId = this.ots.activeOTSTarget.targetVessel.coastGuardNumber ? this.ots.activeOTSTarget.targetVessel.coastGuardNumber : this.ots.activeOTSTarget.targetVessel.stateRegulationNumber;


        for (const member of this.emEfpRoster) {
          if (member.vessel) {
            const memberVesselId = member.vessel.coastGuardNumber ? member.vessel.coastGuardNumber : member.vessel.stateRegulationNumber;
            if (memberVesselId === activeVesselId) {
              affectedVessels.push(member.vessel);
            }
          }
        }
        for (const vessel of affectedVessels) {
          vessel.tripsTaken = this.getTripsTaken(vessel, moment().year());
          vessel.selectedTrips = this.getSelectedTrips(vessel, moment().year());
          vessel.tripsTakenLastYear = this.getTripsTaken(vessel, moment().subtract(1, 'years').year());
          vessel.selectedTripsLastYear = this.getSelectedTrips(vessel, moment().subtract(1, 'years').year());
          vessel.coveredYTD = Math.floor((vessel.selectedTrips / vessel.tripsTaken) * 100);
          vessel.coveredLastYear = Math.floor((vessel.selectedTripsLastYear / vessel.tripsTakenLastYear) * 100);
        }
        return affectedVessels;
      } else {
      // TBD - Port Group
        return ['fish'];
      }
    }

    private get targetHistory() {
      if (this.ots.activeOTSTarget.targetType === 'Fishery Wide') {
        return this.otsTargetHistory.filter( (target) => target.targetType === this.ots.activeOTSTarget.targetType && target.fishery === this.ots.activeOTSTarget.fishery);
      } else if (this.ots.activeOTSTarget.targetType === 'Vessel') {
        return this.otsTargetHistory.filter( (target) => target.targetType === this.ots.activeOTSTarget.targetType && target.fishery === this.ots.activeOTSTarget.fishery && target.targetVessel.vesselName === this.ots.activeOTSTarget.targetVessel.vesselName);
      } else {
        return [];
      }

    }

    private optionsFn(val: string) {
      return moment(val) >= moment().subtract(1, 'days');
    }

    private formatDate(rawdate: string) {
        return moment(rawdate).format('MMM DD, YYYY');
    }

    private getTripsTaken(vessel: any, year: any) {
      const vesselID = vessel.coastGuardNumber ? vessel.coastGuardNumber : vessel.stateRegulationNumber;
      let count = 0;
      for (const trip of this.emEfpTrips) {
        const tripVesselID = trip.vessel!.coastGuardNumber ? trip.vessel!.coastGuardNumber : trip.vessel!.stateRegulationNumber;
        if ( tripVesselID === vesselID && ((moment(trip.departureDate).years() || moment(trip.returnDate).years()) === year) ) {
          count++;
        }
      }
      return count;
    }

    private getSelectedTrips(vessel: any, year: any) {
      const vesselID = vessel.coastGuardNumber ? vessel.coastGuardNumber : vessel.stateRegulationNumber;
      let count = 0;
      for (const trip of this.emEfpTrips) {
        const tripVesselID = trip.vessel!.coastGuardNumber ? trip.vessel!.coastGuardNumber : trip.vessel!.stateRegulationNumber;
        if ( tripVesselID === vesselID && trip.isSelected && ((moment(trip.departureDate).years() || moment(trip.returnDate).years()) === year) ) {
          count++;
        }
      }
      return count;
    }

    // private getCoveredPercent(vessel: any) {
    //   const coveredPercent = this.getSelectedTrips(vessel) / this.getTripsTaken(vessel) * 100;
    //   return coveredPercent ? coveredPercent : 0;
    // }


    private async deactivateTarget() {
      try {
        const masterDB: Client<any> = couchService.masterDB;

        const oldDoc = await masterDB.get(this.ots.activeOTSTarget._id);
        oldDoc.status = 'Inactive';
        masterDB.put( oldDoc._id, oldDoc, oldDoc._rev ).then(
          () => {
            this.$router.push({path: '/ots-management'});
          }
        );

      } catch (err) {
        this.errorAlert(err);
      }
    }

    private async saveTarget() {
      if (this.ots.activeOTSTarget && this.ots.activeOTSTarget._id && this.ots.activeOTSTarget._rev) {
        try {
          const masterDB: Client<any> = couchService.masterDB;

          // set unchanged existing document status to inactive

          const oldDoc = await masterDB.get(this.ots.activeOTSTarget._id);
          oldDoc.status = 'Inactive';
          masterDB.put( oldDoc._id, oldDoc, oldDoc._rev ).then(
            () => {
              // create new document with new changes
              delete this.ots.activeOTSTarget.__index;
              delete this.ots.activeOTSTarget._id;
              delete this.ots.activeOTSTarget._rev;
              this.ots.activeOTSTarget.status = 'Active';
              this.ots.activeOTSTarget.createdBy = authService.getCurrentUser()!.username;
              this.ots.activeOTSTarget.createdDate = moment().format();
              if (this.ots.newTarget === true) {
                this.ots.newTarget = false;
              }

              masterDB.post(this.ots.activeOTSTarget).then(
                () => {
                  this.$router.push({path: '/ots-management'});
                }
              );
            }
          );

          // masterDB.put(this.ots.activeOTSTarget._id,
          //               this.ots.activeOTSTarget,
          //               this.ots.activeOTSTarget._rev)
          //               .then( () => {this.$router.push({path: '/ots-management'});
          //               });
        } catch (err) {
          this.errorAlert(err);
          }
      } else {
        try {
          const masterDB: Client<any> = couchService.masterDB;

          this.ots.activeOTSTarget.status = 'Active';
          this.ots.activeOTSTarget.createdBy = authService.getCurrentUser()!.username;
          this.ots.activeOTSTarget.createdDate = moment().format();

          masterDB.post(this.ots.activeOTSTarget).then( () => {
                      this.$router.push({path: '/ots-management'});
                  });
        } catch (err) {
          this.errorAlert(err);
        }

      }
    }

    get effectiveDate(): string {
        if (this.ots.activeOTSTarget) {
            return moment(this.ots.activeOTSTarget.effectiveDate).format('YYYY/MM/DD');
        } else {
          return '';
        }
    }

    set effectiveDate(value: string) {
        if (this.ots.activeOTSTarget) {
            this.ots.activeOTSTarget.effectiveDate = value;
        }
    }

    get expirationDate(): string {
        if (this.ots.activeOTSTarget) {
            return moment(this.ots.activeOTSTarget.expirationDate).format('YYYY/MM/DD');
        } else {
          return '';
        }
    }

    set expirationDate(value: string) {
        if (this.ots.activeOTSTarget) {
            this.ots.activeOTSTarget.expirationDate = value;
        }
    }

    private expirationDateOptionsFn(val: string) {
      if (this.ots.activeOTSTarget && this.ots.activeOTSTarget.effectiveDate) {
          return moment(val) >= moment(this.ots.activeOTSTarget.effectiveDate);
      }
    }

    private filterVessels(val: string, update: any, abort: any) {
      // update(async () => {
      //       try {
      //         const masterDB: Client<any> = couchService.masterDB;
      //         const queryOptions: ListOptions = {
      //           limit: 7,
      //           start_key: val.toLowerCase(),
      //           inclusive_end: true,
      //           descending: false
      //         };

      //         const vessels = await masterDB.viewWithDocs<any>(
      //           'optecs_trawl',
      //           'all_vessel_names',
      //           queryOptions
      //         );

      //         this.vessels = vessels.rows.map((row: any) => row.doc);
      //       } catch (err) {
      //         this.errorAlert(err);
      //       }
      //     });
        if (val.length > 0) {
          update(
            this.vessels = this.emEfpRoster.map((member) => member.vessel ).filter( (vessel: any) => vessel.vesselName!.toLowerCase().includes(val.toLowerCase()))
          );
          } else {
          update(
            this.vessels = this.emEfpRoster.map((member) => member.vessel )
          );
          }
        }

    private created() {
      this.getOptions();
      this.getHistory();
      this.getEMEFP();
    }

}
</script>

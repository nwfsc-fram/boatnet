import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/app-state';
import { DataService } from '../../_services/data/data.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})

export class TripsComponent implements OnInit {

  trips: any = [
    {type: 'trip', trip_num: '3', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares', },]}, 
    {type: 'trip', trip_num: '2', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '1', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '5', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '4', vessel: 'Excalibur', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: 'active', selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '2', vessel: 'Ms Julie', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '1', vessel: 'Ms Julie', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '3', vessel: 'Ms Julie', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '4', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '3', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: 'active', selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '2', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '1', vessel: 'Last Straw', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '4', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '5', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: 'active', selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},
    {type: 'trip', trip_num: '3', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},], start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
    {type: 'trip', trip_num: '2', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'},   
    {type: 'trip', trip_num: '1', vessel: 'Raven', 'coast_guard_number': 'fgr243rt', permits: [{id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},{id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},{id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},],start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: "Newport", end_port: "same as start", messages: [], id: '123456'}, 
   ]

   vessel = this.stateSvc.currentState.vessel
   permit = this.stateSvc.currentState.permit
   isDBSynced: Observable<boolean>;
   loading =false;
   searchstring = '';
   allTrips: any;

   searchTrips(searchstring) {  

    var keys = Object.keys(this.allTrips[0])
    console.log(keys)
    var results = new Set()
    
    if (searchstring !== '') {
      this.allTrips.filter(function(element) {
        // return element.state_reg_number.toLowerCase().includes('00') || element.vessel_name.toLowerCase().includes('q');
        
        for (var iterkey of keys) {
          if (element[iterkey]) {
            if (element[iterkey].toString().toLowerCase().includes(searchstring)) {
              results.add(element)
            }
            // return element[iterkey].toLowerCase().includes('a')
          }  
        }

      });
      // console.log(this.couchData)
      console.log(Array.from(results).sort())
      this.trips = results
    } else {
      this.trips = this.allTrips     
      console.log(this.trips)
    }
  }

  constructor(private stateSvc: StateService,    
              private dataService: DataService,) { }

  ngOnInit() {

    this.isDBSynced = this.dataService.initialSyncComplete;
    this.stateSvc.setStateName('trips');
    this.stateSvc.setState(<AppState>{ name: 'trips' })

    if (this.stateSvc.currentState.vessel === undefined) {
      this.stateSvc.setVessel({vessel_name: 'Excalibur', 'coast_guard_number': 'fgr243rt', 'state_reg_number': '12fef23', vessel_reg_num: '123abc' ,permits: [] , id: '123456', type: 'vessel', created_by: 'seth.gerou', created_date: '12/2/2212', ifq_port_code: "452",
      ifq_port_id: 558, is_mothership: "", notes: "", port_code: "PRN", port_group: "SF", port_id: "11486", port_name: "PRINCETON (HALF MOON BAY)", registered_length: null, registered_length_um: "", safety_decal_exp: "", state: "CA", vessel_orig_id: "14637", vessel_status: "A", vessel_type: "2", vessel_uuid: "58291e7b-2651-4561-8841-d3e8200ee5f7"})
    }
    if (this.stateSvc.currentState.user === undefined) {
      this.stateSvc.setUser({first_name: 'Seth', last_name: 'Gerou', email: 'seth.gerou@noaa.gov', home: '206-555-1212', mobile: '425-555-1212', roles: ['captain'], vessel: 'Boaty McBoatface', home_port: "Seattle", id: '0', type: 'user', created_by: 'seth.gerou', created_date: '2/2/22', address: '123 fake st', city: 'springfield', state: 'ma', zip: '12345', notification_prefs: [], token: "", username: 'sethgerou', password: 'password1', pwexpiry: '2/2/22', firstName: 'seth', lastName: 'gerou', programs: [], role: 'captain'})
    }
    
    this.loading = true
    if (!this.dataService.initialSyncComplete.getValue()) {
      this.dataService.connectDatabase(
        'test',
        'test'
      );
    }

    this.allTrips = this.trips;
  }

  clearTrip() {
    this.stateSvc.clearTrip()
  }

  setTrip(trip) {
    this.stateSvc.setTrip(trip)
  }

}

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/app-state';
import { DataService } from '../../_services/data/data.service';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  model: any = {};
  loading = false;
  hide = true;
  returnUrl: string;
  vessel = this.stateService.currentState.vessel
  permit = this.stateService.currentState.permit
  
  isDBSynced: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private stateService: StateService,
  ) { }

  ngOnInit() {
    this.stateService.setState(<AppState>{ name: 'login' });    

    if (this.stateService.currentState.vessel === undefined) {
      this.stateService.setVessel({
        vessel_name: 'Excalibur', 
        vessel_reg_num: '123abc',
        permits: [], 
        id: '123456', 
        type: 'vessel', 
        created_by: 'seth.gerou', 
        created_date: '12/2/2212',
        coast_guard_number: '34gsfdg',
        state_reg_number: 'fv3443rf',
        ifq_port_code: "452",
        ifq_port_id: 558,
        is_mothership: "",
        notes: "",
        port_code: "PRN",
        port_group: "SF",
        port_id: "11486",
        port_name: "PRINCETON (HALF MOON BAY)",
        registered_length: null,
        registered_length_um: "",
        safety_decal_exp: "",
        state: "CA",
        vessel_orig_id: "14637",
        vessel_status: "A",
        vessel_type: "2",
        vessel_uuid: "58291e7b-2651-4561-8841-d3e8200ee5f7"
      })
    }
    if (this.stateService.currentState.user === undefined) {
      this.stateService.setUser({first_name: 'Seth', last_name: 'Gerou', email: 'seth.gerou@noaa.gov', home: '206-555-1212', mobile: '425-555-1212', roles: ['captain'], vessel: 'Boaty McBoatface', home_port: "Seattle", id: '0', type: 'user', created_by: 'seth.gerou', created_date: '2/2/22', address: '123 fake st', city: 'springfield', state: 'ma', zip: '12345', notification_prefs: [], token: "", username: 'sethgerou', password: 'password1', pwexpiry: '2/2/22', firstName: 'seth', lastName: 'gerou', programs: [], role: 'captain'})
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isDBSynced = this.dataService.initialSyncComplete;
    this.login()
  }

  login() {
    this.loading = true;
          if (!this.dataService.initialSyncComplete.getValue()) {
            this.dataService.connectDatabase(
              this.model.username,
              this.model.password
            );
          }
          this.router.navigate([this.returnUrl]);
  }

}


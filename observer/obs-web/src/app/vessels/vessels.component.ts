import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-vessels',
  templateUrl: './vessels.component.html',
  styleUrls: ['./vessels.component.scss']
})
export class VesselsComponent implements OnInit {

  vessels = [
    {vessel_name: "Excalibur", uscg_num: 'CG63824', state_reg: 'WA984325'},
    {vessel_name: "Ms Julie", uscg_num: 'CG44144', state_reg: 'CA984325'},
    {vessel_name: "Last Straw", uscg_num: 'CG171717', state_reg: 'CA984325'},
    {vessel_name: "Raven", uscg_num: 'CG96301', state_reg: 'OR984325'},
  ]

  currentVessel = this.stateSvc.currentState.vessel


  constructor(private stateSvc: StateService,) { }

  ngOnInit() {
    this.stateSvc.setStateName('vessel-management');
  }

  setVessel(vessel) {
    this.stateSvc.setVessel(vessel);
    this.currentVessel = this.stateSvc.currentState.vessel
  }

}

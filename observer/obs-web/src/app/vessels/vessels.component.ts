import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-vessels',
  templateUrl: './vessels.component.html',
  styleUrls: ['./vessels.component.scss']
})
export class VesselsComponent implements OnInit {

  vessels = [
    {vessel_name: "Excalibur", vessel_reg_num: 'WA984325'},
    {vessel_name: "Ms Julie", vessel_reg_num: 'CA984325'},
    {vessel_name: "Last Straw", vessel_reg_num: 'CA984325'},
    {vessel_name: "Raven", vessel_reg_num: 'OR984325'},
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

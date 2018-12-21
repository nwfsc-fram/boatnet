import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { DataService } from '../../_services/data/data.service';

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

  // vessels: any[] = []; 

  
  currentVessel = this.stateSvc.currentState.vessel


  constructor(
    private stateSvc: StateService,
    private dataSvc: DataService
     ) { }

  ngOnInit() {
    this.stateSvc.setStateName('vessel-management');
    // this.dataSvc.getVessels().then(vessels => {
    //   this.vessels = vessels;
    //   console.log("loaded ${this.vessels.length} vessels from db.")
    //   }
    // );

    
    // console.log('Vessels:')
    // console.log(this.vessels.length)
  }

  setVessel(vessel) {
    this.stateSvc.setVessel(vessel);
    this.currentVessel = this.stateSvc.currentState.vessel
  }

}

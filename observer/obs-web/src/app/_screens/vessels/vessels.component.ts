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
  couchData: any = []
  allVessels: any
  searchstring = '';

  searchVessels(searchstring) {  

    var keys = Object.keys(this.allVessels[0])
    console.log(keys)
    var results = new Set()
    
    if (searchstring !== '') {
      this.allVessels.filter(function(element) {
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
      this.couchData = results
    } else {
      this.couchData = this.allVessels      
      console.log(this.couchData)
    }
  }

  constructor(
    private stateSvc: StateService,
    private dataSvc: DataService
     ) { 

     }

  ngOnInit() {
    this.stateSvc.setStateName('vessel-management');
    
    this.dataSvc.getVessels().then(vessels => {
      this.couchData = vessels.docs
      this.allVessels = vessels.docs
      console.log(this.couchData)
    })
  }

  setVessel(vessel) {
    this.stateSvc.setVessel(vessel);
    this.currentVessel = this.stateSvc.currentState.vessel
  }



}

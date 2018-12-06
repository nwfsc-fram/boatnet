import { Component, OnInit } from '@angular/core';
import { StateService } from '../_services/data/state.service';

@Component({
  selector: 'app-vessel-permits',
  templateUrl: './vessel-permits.component.html',
  styleUrls: ['./vessel-permits.component.scss']
})
export class VesselPermitsComponent implements OnInit {

  vessel_permits = [
    {vessel_name:'Excalibur', permit_number: 'A21rv35',target_fish: 'Sablefish',selection_type: 'trip-by-trip', selected:'yes'},
    {vessel_name:'Last Straw', permit_number: 'C54ge98',target_fish: 'Hake',selection_type: 'Selected through 12/1',selected:'yes'},
    {vessel_name:'Ms Julie', permit_number: 'Q66wq44',target_fish: 'Halibut', selection_type: 'Not Selected through 1/1',selected:'no'},
    {vessel_name:'Raven', permit_number: 'P03mr74',target_fish: 'Shrimp',selection_type: 'trib-by-trip',selected:'no'}
  ]

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('vessel-permits');
  }

  setVesselandPermit(vessel_name, permit_number) {
    this.stateSvc.setPermit(permit_number);
    this.stateSvc.setVessel(vessel_name);
  }

}

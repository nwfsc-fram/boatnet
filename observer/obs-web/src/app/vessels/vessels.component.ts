import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-vessels',
  templateUrl: './vessels.component.html',
  styleUrls: ['./vessels.component.scss']
})
export class VesselsComponent implements OnInit {

  vessels = [
    {name: "Excalibur"},
    {name: "Ms Julie"},
    {name: "Last Straw"},
    {name: "Raven"},
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

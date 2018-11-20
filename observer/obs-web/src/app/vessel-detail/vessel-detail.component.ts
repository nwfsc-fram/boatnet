import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { Vessel } from '../_models/vessel'
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-vessel-detail',
  templateUrl: './vessel-detail.component.html',
  styleUrls: ['./vessel-detail.component.scss']
})
export class VesselDetailComponent implements OnInit {

  vessel: Vessel

  vesselForm: FormGroup;

  constructor(
    private stateSvc: StateService,
    private fb: FormBuilder) {
      this.createForm();
     }

  ngOnInit() {
    this.stateSvc.currentState.name = "vessel-detail"
    this.vessel = this.stateSvc.currentState.vessel

    if (this.stateSvc.currentState.vessel === undefined) {
      this.vessel = Vessel.createVessel();
    }

    this.createEditForm()

  }

  createForm() {
    this.vesselForm = this.fb.group(
      {
        id: null,
        vessel_name: null,
        uscg_num: null,
        state_reg: null,
      }
    )
  }

  createEditForm() {
    this.vesselForm = this.fb.group(
      {
        id: this.vessel.id,
        vessel_name: this.vessel.vessel_name,
        uscg_num: this.vessel.uscg_num,
        state_reg: this.vessel.state_reg,
      }
    )    
  }
  
}

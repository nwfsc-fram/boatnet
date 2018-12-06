import { Component, OnInit, createPlatformFactory } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Permit } from '../../_models/permit'
import {
  FormControl,
  NgForm,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  Validators,
  ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-permit-detail',
  templateUrl: './permit-detail.component.html',
  styleUrls: ['./permit-detail.component.scss']
})
export class PermitDetailComponent implements OnInit {

  permit: Permit = this.stateSvc.currentState.permit

  vessels = [
    {label: "Excalibur", value: "Excalibur"},
    {label: "Ms Julie", value: "Ms Julie"},
    {label: "Last Straw", value: "Last Straw"},
    {label: "Raven", value: "Raven"},
  ]

  reg_nums = {
    "Excalibur": "123456",
    "Ms Julie": "ABC123",
    "Last Straw": "555DEF",
    "Raven": "OP43545"
  }

  permitForm: FormGroup;

  constructor(
    private stateSvc: StateService,
    private fb: FormBuilder
  ) {
    this.createForm();
   }

  ngOnInit() {
    this.stateSvc.setStateName('permit')

    if (this.stateSvc.currentState.permit === undefined) {
      this.permit = Permit.createPermit();
    } 
    
    this.createEditForm()
  }

  
  createForm() {
    
    this.permitForm = this.fb.group(
      { 
        permit_num: null,
        vessel: null,
        vessel_registration_number: null,
        fishery: null,
        certificate_start_date: null,
        certificate_end_date: null,
        endorsed_length: null     
      }
      )
    }

  createEditForm() {
    this.permitForm = this.fb.group(
      {
        permit_num: this.permit.permit_num,
        vessel: this.permit.vessel,
        vessel_registration_number: this.permit.vessel_registration_number,
        fishery: this.permit.fishery,
        certificate_start_date: this.permit.certificate_start_date,
        certificate_end_date: this.permit.certificate_end_date,
        endorsed_length: this.permit.endorsed_length             
      }
    )
  }

  setPermitVessel() {
    const formModel = this.permitForm.value
    this.stateSvc.currentState.permit.vessel = formModel.vessel
    console.log(formModel.vessel)
  }

  getVesselRegNum() {
    return this.reg_nums[this.permit.vessel]
  }
    
}
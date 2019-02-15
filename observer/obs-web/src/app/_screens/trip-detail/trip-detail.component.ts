import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Trip } from '../../_models/trip';
import { User } from '../../_models/user';
import { Vessel} from '../../_models/vessel'

import {
  FormControl,
  NgForm,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  Validators,
  ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})

export class TripDetailComponent implements OnInit {

  trip: Trip = this.stateSvc.currentState.trip;
  vessel: Vessel = this.stateSvc.currentState.vessel;
  currentUser = this.stateSvc.currentState.user.first_name + " " + this.stateSvc.currentState.user.last_name

  // permits = [
  //       {title: 'GF0001', value: 1},
  //       {title: '90011', value: 2},
  //       {title: '777qwe', value: 3},
  //     ]

  permits = [
    {label: 'GF0001 - Limited Entry - Catch Shares', value: {id: 'A21rv35', type: 'permit', permit_num: 'GF0001', fishery: 'Limited Entry - Catch Shares'}},
    {label: '90011 - Trawl Gear - MOD EFP', value: {id: 'W32be87', type: 'permit', permit_num: '90011', fishery: 'Trawl Gear - MOD EFP'}},
    {label: '777qwe - Catch Shares - Shore Side Hake', value: {id: 'N11es32', type: 'permit', permit_num: '777qwe', fishery: 'Catch Shares - Shore Side Hake'}},
    {label: 'Open Access', value: {id: 'OA', type: 'permit', permit_num: 'na', fishery: 'Open Access'}},
    {label: 'Permit Not Listed', value: {id: 'NL', type: 'permit', permit_num: 'NL', fishery: 'Not Listed'}},
  ]

  tripForm: FormGroup;

  constructor(
    private stateSvc: StateService, 
    private fb: FormBuilder) {
    this.createForm();
   }

  ngOnInit() {
    this.stateSvc.setStateName('trip');

    if (this.stateSvc.currentState.trip === undefined) {
      this.trip = Trip.createTrip(this.stateSvc.currentState.user.home_port, this.stateSvc.currentState.vessel);
    }

    this.createEditForm()

  }

  createForm() {

    this.tripForm = this.fb.group(
      {
        vessel: this.vessel,
        start_date: null,
        end_date: null,
        is_open: true,
        selected: false,
        permits: null,
        messages: false,
        unlisted_permit: null,
        start_port: this.stateSvc.currentState.user.home_port,
        end_port: "Same as start"
      }

    )
  }

  createEditForm() {
    this.tripForm = this.fb.group(
      {
        vessel: this.trip.vessel,
        start_date: this.trip.start_date,
        end_date: this.trip.end_date,
        is_open: this.trip.is_open,
        selected: this.trip.selected,
        permits: null,
        messages: this.trip.messages,
        unlisted_permit: this.trip.unlisted_permit,
        start_port: this.trip.start_port,
        end_port: this.trip.end_port
      }
    )
  }

  setTripPermits() {
    const formModel = this.tripForm.value
    this.stateSvc.currentState.trip.permits = formModel.permits
    console.log(this.stateSvc.currentState.trip)
  }

  addUnlistedPermit() {
    const formModel = this.tripForm.value
    this.stateSvc.currentState.trip.permits.push(formModel.unlisted_permit)        
    console.log(this.stateSvc.currentState.trip)
  }

  editMessage(message) {
    console.log(message)
    this.stateSvc.setMessage(message)
    this.stateSvc.currentState.trip.messages.splice(message, 1)
  }

  openTrip() {
    this.stateSvc.currentState.trip.is_open = true
    console.log(this.stateSvc.currentState.trip.is_open)
  }

  closeTrip() {
    this.stateSvc.currentState.trip.is_open = false
    console.log(this.stateSvc.currentState.trip.is_open)
  }

}

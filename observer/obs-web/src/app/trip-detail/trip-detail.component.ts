import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { Trip } from '../_models/trip';
import { TripsComponent } from '../trips/trips.component';
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

  trip: Trip = this.stateSvc.currentState.trip

  tripForm: FormGroup;

  constructor(
    private stateSvc: StateService, 
    private fb: FormBuilder) {
    this.createForm();
   }

  ngOnInit() {
    this.stateSvc.setStateName('trip');
    this.createEditForm()
  }

  createForm() {

    this.tripForm = this.fb.group(
      {
        vessel: null,
        start_date: null,
        end_date: null,
        is_open: true,
        selected: false,
        permits: null,
        messages: false,
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
      }
    )
  }

}

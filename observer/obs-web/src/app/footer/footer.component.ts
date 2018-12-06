import { Component, OnInit } from '@angular/core';
import { StateService } from '../_services/data/state.service';
import { AppState } from '../_models/app-state';
import { Vessel } from '../_models/vessel';
import { Router } from '@angular/router';
import { Message } from '../_models/message';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  message: Message;
  name: string;
  trip = this.stateSvc.currentState.trip
  searchConfig = ['trips', 'user-management', 'vessel-management', 'permits-management']
  createConfig = ['user-management', 'vessel-management', 'permits-management', 'trips']
  confirmConfig = ['user-preferences', 'ots-management', 'trip']

  constructor(
    private stateSvc: StateService, 
    private router: Router,
  ) { }

  ngOnInit() {
    this.name = this.stateSvc.currentState.name
    this.message = this.stateSvc.currentState.message
    console.log(this.name)
  }

  clearTrip() {
    this.stateSvc.clearTrip()
  }
  
  openTrip() {
    this.stateSvc.currentState.trip.is_open = true
    console.log(this.stateSvc.currentState.trip.is_open)
  }

  closeTrip() {
    this.stateSvc.currentState.trip.is_open = false
    console.log(this.stateSvc.currentState.trip.is_open)
  }

  clearUser() {
    this.stateSvc.clearUser()
  }

  clearVessel() {
    this.stateSvc.clearVessel()
  }

  clearPermit() {
    this.stateSvc.clearPermit()
  }

  saveMessage() {
    this.stateSvc.currentState.trip.messages.unshift(this.message)
    this.stateSvc.clearMessage()
    this.router.navigate(['/trip']);
  }

  discardMessage() {
    if (confirm("are you sure you want to delete this message?")) {
      this.stateSvc.clearMessage()
      this.router.navigate(['/trip'])
  } else {
      return
  }

  }

}

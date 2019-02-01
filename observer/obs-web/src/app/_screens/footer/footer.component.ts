import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/app-state';
import { Vessel } from '../../_models/vessel';
import { Message } from '../../_models/message';
import { DataService } from '../../_services/data/data.service';
// import { EventEmitter } from 'events';

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
  show: boolean = false;
  inputtext: string = this.dataSvc.searchstring;
  @Output() searchstring = new EventEmitter();

  constructor(
    private stateSvc: StateService, 
    private router: Router,
    private dataSvc: DataService,
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

  setSearchString() {
    this.dataSvc.searchstring = this.inputtext
    console.log(this.dataSvc.searchstring)
    this.searchstring.emit(this.inputtext)
  }

}

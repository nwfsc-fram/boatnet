import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-permits',
  templateUrl: './permits.component.html',
  styleUrls: ['./permits.component.scss']
})
export class PermitsComponent implements OnInit {

  vessel = this.stateSvc.currentState.vessel

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('permits-management');
  }

}

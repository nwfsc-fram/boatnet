import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { OtsTarget } from '../../_models/ots-target';

@Component({
  selector: 'app-ots-target-detail',
  templateUrl: './ots-target-detail.component.html',
  styleUrls: ['./ots-target-detail.component.scss']
})
export class OtsTargetDetailComponent implements OnInit {

  target: OtsTarget = this.stateSvc.currentState.otstarget

  constructor(private stateSvc: StateService,) { }

  ngOnInit() {
  }

}

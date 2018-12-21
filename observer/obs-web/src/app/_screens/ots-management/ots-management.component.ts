import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';

@Component({
  selector: 'app-ots-management',
  templateUrl: './ots-management.component.html',
  styleUrls: ['./ots-management.component.scss']
})
export class OTSManagementComponent implements OnInit {

  previous_covereage_rates = [
    {rate: '22%', start_date: '10/12/2018', end_date: '-'},
    {rate: '27%', start_date: '7/1/2018', end_date: '10/12/2018'},
    {rate: '18%', start_date: '1/1/2018', end_date: '7/1/2018'}
  ]

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('ots-management');
  }

}

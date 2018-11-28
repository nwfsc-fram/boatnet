import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { Permit } from '../_models/permit'

@Component({
  selector: 'app-permits',
  templateUrl: './permits.component.html',
  styleUrls: ['./permits.component.scss']
})
export class PermitsComponent implements OnInit {

  vessel = this.stateSvc.currentState.vessel

  permits: Permit[] = [
    {type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "250226", fishery: "EM EFP" , id: "GF0001", certificate_start_date: "2019-01-01T08:00:00Z", certificate_end_date: "2019-12-31T08:00:00Z", vessel: "Excalibur", endorsed_length: 64.84, },
    {type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "250226", fishery: "EM EFP" , id: "GF0011", certificate_start_date: "2019-01-01T08:00:00Z", certificate_end_date: "2019-12-31T08:00:00Z", vessel: "UNIDENTIFIED", endorsed_length: 83, },
    {type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "250226", fishery: "EM EFP" , id: "GF0022", certificate_start_date: "2019-01-01T08:00:00Z", certificate_end_date: "2019-12-31T08:00:00Z", vessel: "Raven", endorsed_length: 64.84, },
    {type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "250226", fishery: "EM EFP" , id: "GF0035", certificate_start_date: "2019-01-01T08:00:00Z", certificate_end_date: "2019-12-31T08:00:00Z", vessel: "Ms Julie", endorsed_length: 64.84, },    
  ]

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('permits-management');
  }

}

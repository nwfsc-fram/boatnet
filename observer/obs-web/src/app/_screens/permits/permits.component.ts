import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Permit } from '../../_models/permit'

@Component({
  selector: 'app-permits',
  templateUrl: './permits.component.html',
  styleUrls: ['./permits.component.scss']
})
export class PermitsComponent implements OnInit {

  vessel = this.stateSvc.currentState.vessel

  permits: Permit[] = [
    {id: "1", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "250226", fishery: "EM EFP" , permit_num: "GF0001", certificate_start_date: "1/1/2018", certificate_end_date: "12/31/2018", vessel: "Excalibur", endorsed_length: 64.84, },
    {id: "2", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "245779", fishery: "EM EFP" , permit_num: "GF0011", certificate_start_date: "7/1/2018", certificate_end_date: "12/31/2018", vessel: "UNIDENTIFIED", endorsed_length: 83, },
    {id: "3", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "1048304", fishery: "EM EFP" , permit_num: "GF0022", certificate_start_date: "1/1/2018", certificate_end_date: "12/31/2018", vessel: "Raven", endorsed_length: 64.84, },
    {id: "4", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "WN2165NM", fishery: "EM EFP" , permit_num: "GF0035", certificate_start_date: "1/1/2018", certificate_end_date: "12/31/2018", vessel: "Ms Julie", endorsed_length: 64.84, },    
  ]

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('permits-management');
  }

  setPermit(permit) {
    this.stateSvc.setPermit(permit)
  }

}

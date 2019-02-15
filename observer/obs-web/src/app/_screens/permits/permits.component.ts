import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Observable } from  "rxjs";
import { HttpClient } from  "@angular/common/http";
import { HttpParams } from "@angular/common/http";
import { Permit } from '../../_models/permit';

import { tap, map } from "rxjs/operators";
import { from } from 'rxjs';

@Component({
  selector: 'app-permits',
  templateUrl: './permits.component.html',
  styleUrls: ['./permits.component.scss']
})

export class PermitsComponent implements OnInit {

  vessel = this.stateSvc.currentState.vessel

  // permits: Permit[] = [
  //   {id: "1", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "250226", fishery: "EM EFP" , permit_num: "GF0001", certificate_start_date: "1/1/2018", certificate_end_date: "12/31/2018", vessel: "Excalibur", endorsed_length: 64.84, },
  //   {id: "2", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "245779", fishery: "EM EFP" , permit_num: "GF0011", certificate_start_date: "7/1/2018", certificate_end_date: "12/31/2018", vessel: "UNIDENTIFIED", endorsed_length: 83, },
  //   {id: "3", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "1048304", fishery: "EM EFP" , permit_num: "GF0022", certificate_start_date: "1/1/2018", certificate_end_date: "12/31/2018", vessel: "Raven", endorsed_length: 64.84, },
  //   {id: "4", type: "permit", created_by: "seth.gerou", created_date: '9/9/2018', vessel_registration_number : "WN2165NM", fishery: "EM EFP" , permit_num: "GF0035", certificate_start_date: "1/1/2018", certificate_end_date: "12/31/2018", vessel: "Ms Julie", endorsed_length: 64.84, },    
  // ]

  permitsObservable;

  hasMore: Boolean = false;
  offset: number = 0;
  permits: any = []
  allPermits = []
  searchstring = '';

  searchPermits(searchstring) {  

    var keys = Object.keys(this.allPermits[0])
    console.log(keys)
    var results = new Set()
    
    if (searchstring !== '') {
      this.allPermits.filter(function(element) {
        // return element.state_reg_number.toLowerCase().includes('00') || element.vessel_name.toLowerCase().includes('q');
        
        for (var iterkey of keys) {
          if (element[iterkey]) {
            if (element[iterkey].toString().toLowerCase().includes(searchstring)) {
              results.add(element)
            }
            // return element[iterkey].toLowerCase().includes('a')
          }
        }
      });
      // console.log(this.couchData)
      console.log(Array.from(results).sort())
      this.permits = results
    } else {
      this.permits = this.allPermits      
      console.log(this.permits)
    }
  }

  constructor(
    private stateSvc: StateService,
    private httpClient:HttpClient,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('permits-management');

    this.permitsObservable = this.httpClient.get   
    // ("https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_v/?offset=" + this.offset + "&limit=500")
    // ("https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_v/?limit=500")
    ("https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500")
        .pipe(
          // tap(console.log)
          map((res) => {
            console.log(res['items'])
            console.log(res['hasMore'])
            
            for (var item of res['items']) {
              console.log(item)
              if (item.status === "Active") {
                this.permits.push(item)
                console.log(this.permits)
              }
            }
            
        }) 

      )  
      
    this.allPermits = this.permits
          
  }


  setPermit(permit) {
    this.stateSvc.setPermit(permit)
  }

}

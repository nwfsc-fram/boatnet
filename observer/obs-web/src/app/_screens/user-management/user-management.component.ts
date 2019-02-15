import { Component, OnInit } from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import { StateService } from '../../_services/data/state.service';
import { User } from '../../_models/user'

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  activeUsers: any = [
    {first_name: 'Seth', last_name: 'Gerou', email: 'seth.gerou@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'captain', vessel: 'Boaty McBoatface', home_port: "Seattle", id: '0'},
    {first_name: 'Todd', last_name: 'Hay', email: 'todd.hay@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'permit owner', home_port: "Seattle", vessel: '-', id: '1'},
    {first_name: 'Neil', last_name: 'Riley', email: 'neil.riley@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'staff', home_port: "Seattle", vessel: '-', id: '3'},
    {first_name: 'Nicholas', last_name: 'Shaffer', email: 'nicholas.shaffer@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'staff', home_port: "Seattle", vessel: '-', id: '5'},
    {first_name: 'Melina', last_name: 'Shak', email: 'melina.shak@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'permit owner', home_port: "Seattle", vessel: '-', id: '4'},
    {first_name: 'Will', last_name: 'Smith', email: 'will.smith@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'provider', home_port: "Seattle", vessel: '-', id: '2'},
  ]

  allActiveUsers: any;
  searchString = '';

  searchActiveUsers(searchstring) {  

    var keys = Object.keys(this.allActiveUsers[0])
    console.log(keys)
    var results = new Set()
    
    if (searchstring !== '') {
      this.allActiveUsers.filter(function(element) {
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
      this.activeUsers = results
    } else {
      this.activeUsers = this.allActiveUsers      
      console.log(this.activeUsers)
    }
  }

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('user-management');
    this.allActiveUsers = this.activeUsers;
  }

  setUser(user: User) {
    this.stateSvc.setUser(user);
  }

}

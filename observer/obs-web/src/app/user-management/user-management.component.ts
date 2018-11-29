import { Component, OnInit } from '@angular/core';
import {InputTextModule} from 'primeng/inputtext';
import { StateService } from '../state.service';
import { User } from '../_models/user'

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  active_users = [
    {first_name: 'Seth', last_name: 'Gerou', email: 'seth.gerou@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'captain', vessel: 'Boaty McBoatface', id: '0'},
    {first_name: 'Todd', last_name: 'Hay', email: 'todd.hay@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'permit owner', vessel: '-', id: '1'},
    {first_name: 'Neil', last_name: 'Riley', email: 'neil.riley@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'staff', vessel: '-', id: '3'},
    {first_name: 'Nicholas', last_name: 'Shaffer', email: 'nicholas.shaffer@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'staff', vessel: '-', id: '5'},
    {first_name: 'Melina', last_name: 'Shak', email: 'melina.shak@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'permit owner', vessel: '-', id: '4'},
    {first_name: 'Will', last_name: 'Smith', email: 'will.smith@noaa.gov', phone: '206-555-1212', mobile: '425-555-1212', role: 'provider', vessel: '-', id: '2'},
  ]

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('user-management');
  }

  setUser(user: User) {
    this.stateSvc.setUser(user);
  }

}

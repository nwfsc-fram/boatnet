import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router'
import { StateService } from '../../_services/data/state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(private _location: Location, private router: Router, private stateSvc: StateService,) { }

  ngOnInit() {
  }

  backClicked() {
    this._location.back();
  }

  forwardClicked() {
    this._location.forward();
  }

  getTitle() {

    var titles = {
      '/':                 'Trips', 
      '/trips':            'Trips',
      '/trip':             'Trip Details',
      '/manage-users':     'Manage Users',
      '/user':             'User Details',
      '/user-config':      'User Config',
      '/manage-vessels':   'Manage Vessels',
      '/vessel-detail':    'Vessel Detail',
      '/manage-permits':   'Manage Permits',
      '/permit-detail':    'Permit Details',
      '/ots-management':   'OTS Management',
      '/message-detail':   'Message Detail',
      '/home':             'Home',
      '/login':            'Login',
    }

    var title = titles[this.router.url]
    return title
  }

}

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
      '/':                 'TRIPS', 
      '/trips':            'TRIPS',
      '/trip':             'TRIP DETAILS',
      '/manage-users':     'MANAGE USERS',
      '/user':             'USER DETAILS',
      '/user-preferences': 'USER PREFERENCES',
      '/manage-vessels':   'MANAGE VESSELS',
      '/vessel-detail':    'VESSEL DETAIL',
      '/manage-permits':   'MANAGE PERMITS',
      '/permit-detail':    'PERMIT DETAILS',
      '/ots-management':   'OTS MANAGEMENT',
      '/message-detail':   'MESSAGE DETAIL',
    }

    var title = titles[this.router.url]
    return title
  }

}

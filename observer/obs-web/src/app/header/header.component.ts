import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router'
import { StateService } from '../state.service';

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
      '/ots-management':   'OTS MANAGEMENT',
      '/manage-users':     'MANAGE USERS',
      '/trips':            'TRIPS',
      '/user-preferences': 'USER PREFERENCES',
      '/manage-vessels':   'MANAGE VESSELS',
      '/manage-permits':   'MANAGE PERMITS',
      // '/vessel-permits':   'VESSEL PERMITS',
      '/':                 'VESSEL PERMITS', 
      '/trip':             'TRIP DETAILS',
    }

    var title = titles[this.router.url]
    return title
  }

}

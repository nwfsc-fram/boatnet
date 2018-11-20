import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {

  title = "User Preferences"
  user = this.stateSvc.currentState.user

  userPrefs = {
    0: {notification_preference: 'email'},
    1: {notification_preference: 'both'},
    2: {notification_preference: 'app only'},
    3: {notification_preference: 'text'},
    4: {notification_preference: 'text'},
    5: {notification_preference: 'email'},
  }

  notification_options = [
    {label: 'email', value: 'email', icon: 'pi pi-envelope'},
    {label: 'text', value: 'text', icon: 'pi pi-mobile'},
    {label: 'both', value: 'both'},    
    {label: 'app only', value: 'app only'}
  ]

  userPreference = this.userPrefs[this.user.id].notification_preference

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('user-preferences');
  }

}

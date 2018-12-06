import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {

  title = "User Preferences"
  user = this.stateSvc.currentState.user

  // userPrefs = {
  //   0: {notification_preference: 'email'},
  //   1: {notification_preference: 'both'},
  //   2: {notification_preference: 'app only'},
  //   3: {notification_preference: 'text'},
  //   4: {notification_preference: 'text'},
  //   5: {notification_preference: 'email'},
  // }

  notification_options = [
    {label: 'email', value: 'email', icon: 'pi pi-envelope'},
    {label: 'text (mobile)', value: 'text', icon: 'pi pi-comment'},
    {label: 'device notification (push)', value: 'notification', icon: 'pi pi-mobile'}, 
  ]

  userPreference = this.stateSvc.currentState.user.notification_prefs

  name = this.stateSvc.currentState.name

  constructor(
    private stateSvc: StateService,
  ) { }

  ngOnInit() {
    this.stateSvc.setStateName('user-preferences');
    this.name = this.stateSvc.currentState.name
    console.log(this.name)
  }

  setNotificationPref(event) {
    console.log(event.value)
    this.stateSvc.currentState.user.notification_prefs = event.value
    console.log(this.stateSvc.currentState.user.notification_prefs)
  }

  getNotificationPref() {
    return this.stateSvc.currentState.user.notification_prefs
  }

}

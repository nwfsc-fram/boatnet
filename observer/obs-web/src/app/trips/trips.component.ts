import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})

export class TripsComponent implements OnInit {

  trips = [
    {vessel: 'Excalibur', permit: 'A21rv35', start_date: '8/03/2018', end_date: '8/20/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'}, 
    {vessel: 'Excalibur', permit: 'A21rv35', start_date: '9/9/2018', end_date: '9/17/2018', status: 'closed', selected: 'yes', messages: 'no', id: '123456'},   
    {vessel: 'Excalibur', permit: 'A21rv35', start_date: '10/23/2018', end_date: '10/31/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'}, 
    {vessel: 'Excalibur', permit: 'A21rv35', start_date: '11/7/2018', end_date: '11/23/2018', status: 'active', selected: 'yes', messages: 'no', id: '123456'},
    {vessel: 'Excalibur', permit: 'A21rv35', start_date: '12/1/2018', end_date: '12/15/2018', status: 'active', selected: 'no', messages: 'yes', id: '123456'},
    {vessel: 'Ms Julie', permit: 'Q66wq44', start_date: '9/9/2018', end_date: '9/17/2018', status: 'closed', selected: 'yes', messages: 'no', id: '123456'},   
    {vessel: 'Ms Julie', permit: 'Q66wq44', start_date: '10/23/2018', end_date: '10/31/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'}, 
    {vessel: 'Ms Julie', permit: 'Q66wq44', start_date: '11/7/2018', end_date: '11/23/2018', status: 'active', selected: 'yes', messages: 'no', id: '123456'},
    {vessel: 'Last Straw', permit: 'A21rv35', start_date: '11/7/2018', end_date: '11/23/2018', status: 'active', selected: 'yes', messages: 'no', id: '123456'},
    {vessel: 'Last Straw', permit: 'A21rv35', start_date: '12/1/2018', end_date: '12/15/2018', status: 'active', selected: 'no', messages: 'yes', id: '123456'},
    {vessel: 'Last Straw', permit: 'A21rv35', start_date: '12/1/2018', end_date: '12/15/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'},
    {vessel: 'Last Straw', permit: 'Q66wq44', start_date: '9/9/2018', end_date: '9/17/2018', status: 'closed', selected: 'yes', messages: 'no', id: '123456'},   
    {vessel: 'Raven', permit: 'Q66wq44', start_date: '10/23/2018', end_date: '10/31/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'}, 
    {vessel: 'Raven', permit: 'Q66wq44', start_date: '11/7/2018', end_date: '11/23/2018', status: 'active', selected: 'yes', messages: 'no', id: '123456'},
    {vessel: 'Raven', permit: 'A21rv35', start_date: '8/03/2018', end_date: '8/20/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'}, 
    {vessel: 'Raven', permit: 'A21rv35', start_date: '9/9/2018', end_date: '9/17/2018', status: 'closed', selected: 'yes', messages: 'no', id: '123456'},   
    {vessel: 'Raven', permit: 'A21rv35', start_date: '10/23/2018', end_date: '10/31/2018', status: 'closed', selected: 'no', messages: 'yes', id: '123456'}, 
   ]

   vessel = this.stateSvc.currentState.vessel
   permit = this.stateSvc.currentState.permit

  constructor(private stateSvc: StateService,) { }

  ngOnInit() {
    this.stateSvc.setStateName('trips');
  }

  setTrip(trip) {
    this.stateSvc.setTrip(trip)
  }

}

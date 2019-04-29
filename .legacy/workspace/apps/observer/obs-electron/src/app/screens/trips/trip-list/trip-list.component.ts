import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trip } from '../../../_models/wcgop/trip';
import { StateService } from '../../../_services/data/state.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { Store, select } from '@ngrx/store';
import * as fromStore from '../../../state';
import { AllVesselsRequested } from '../../../data-layer/vessel/vessel.actions';
import { Observable } from 'rxjs';
import { VesselsState } from '../../../data-layer/vessel/vessel.reducer';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss']
})
export class TripListComponent implements OnInit {
  editing = {};
  columns = [
    { name: 'Trip ID', prop: 'friendly_trip_id' },
    { name: 'Vessel', prop: 'vessel.vessel_name' },
    { name: 'Departure Port', prop: 'ports.departure_port.port_name' },
    { name: 'Departure Date', prop: 'dates.start_date' },
    { name: 'Return Port', prop: 'ports.return_port.port_name' },
    { name: 'Return Date', prop: 'dates.return_date' },
    { name: 'Created By', prop: 'created_by.username' },
    { name: 'Created Date', prop: 'created_date' }
  ];

  displayedColumns = [
    'friendly_trip_id',
    'vessel_name',
    'dept_port',
    'dept_date',
    'ret_port',
    'ret_date'
  ];

  trips: Trip[] = [];
  dataSource = new MatTableDataSource<Trip>(this.trips);

  tripButtonText = 'Start New Trip';

  vesselsFromDB$: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private stateSvc: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<fromStore.State>
  ) {}

  ngOnInit() {
    this.stateSvc.setStateName('trips');
    this.fetchTrips().then(data => {
      this.dataSource.data = data;
    });

    this.store.dispatch(new AllVesselsRequested());

    this.vesselsFromDB$ = this.store.pipe(
      select(state => state.vessels.vessels)
    );
  }

  fetchTrips() {
    return new Promise<Trip[]>((resolve, reject) => {
      this.http
        .get('assets/test_trips.json')
        .toPromise()
        .then(res => {
          resolve(<Trip[]>res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  newTrip() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
}

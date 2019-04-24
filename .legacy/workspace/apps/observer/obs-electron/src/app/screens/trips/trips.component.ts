import { Component, OnInit, Input } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Trip } from '../../_models/wcgop/trip';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})
export class TripsComponent implements OnInit {
  currentTripInfoTitle: string;
  currentTrip: Trip;

  newTrip: Observable<Trip>;

  constructor(private stateSvc: StateService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.currentTripInfoTitle = this.getTripInfoTitle();
    this.stateSvc.setStateName('trips');

    this.newTrip = this.stateSvc.currentTrip;
    this.stateSvc.currentTrip.subscribe((trip: Trip) => {
      this.currentTrip = trip;
      this.currentTripInfoTitle = this.getTripInfoTitle();
    });
  }

  getTripInfoTitle(): string {
    const trip = this.currentTrip;
    if (!trip) {
      return 'No Trip Selected';
    } else {
      const shortId = trip.id.substring(0, 5);
      const vesselName = this.currentTrip.vessel.vessel_name
        ? this.currentTrip.vessel.vessel_name + ' \u00B7 '
        : '';
      return `${vesselName}Trip #${shortId}...`;
    }
  }
}

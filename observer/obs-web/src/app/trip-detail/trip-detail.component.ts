import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { Trip } from '../_models/trip';
import { TripsComponent } from '../trips/trips.component';



@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.scss']
})

export class TripDetailComponent implements OnInit {


  constructor(private stateSvc: StateService,) { }

  ngOnInit() {
  }

}

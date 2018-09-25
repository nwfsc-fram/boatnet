import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Trip } from '../../../_models/wcgop/trip';
import { Haul } from '../../../_models/wcgop/haul'
import { StateService } from '../../../_services/data/state.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-haul-list',
  templateUrl: './haul-list.component.html',
  styleUrls: ['./haul-list.component.scss']
})

export class HaulListComponent implements OnInit {

  currentTripInfoTitle = 'Hauls for Trip ';
  selectedTrip: Trip;
  selectedHaul: Haul;
  selectedRow: Haul;

  cols: any[];

  hauls: Haul[] = [];

  constructor(
    private http: HttpClient,
    private stateSvc: StateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.stateSvc.setStateName('hauls');
    this.fetchHauls().then(data => {
      this.hauls = data;
    });

    this.stateSvc.currentTrip
    .subscribe(
      (trip: Trip) => {
        this.selectedTrip = trip;
        // this.currentTripInfoTitle = `Hauls for Trip (ID ${trip.id.substring(0, 5)}...)`;
      }
    );

    this.stateSvc.currentHaul
    .subscribe(
      (haul: Haul) => {
        this.selectedHaul = haul;
      }
    );

    this.cols = [
      { field: 'friendly_trip_id' , header: 'Haul #' , width: '5%'},
      { field: 'wm' , header: 'WM' , width: '4%'},
      { field: 'gear_perf' , header: 'Gear Perf.' , width: '7%'},
      { field: 'target_strategy' , header: 'Target Strategy' , width: '9%'},
      { field: 'gear_type' , header: 'Gear Type' , width: '7%'},
      { field: 'dates', subfield: 'departure_date' , header: 'Start Date' , width: '7%'},
      { field: 'dates' , subfield: 'return_date' , header: 'End Date' , width: '7%'},
      { field: 'testing' , subfield: 'otc_wt', header: 'OTC WT' , width: '5%'},
      { field: 'testing' , subfield: 'errors', header: 'Errors' , width: '5%'}
    ]

  }

  fetchHauls() {
    return new Promise<Haul[]>((resolve, reject) => {
      this.http
        .get('assets/test_hauls.json')
        .toPromise()
        .then(res => {
          resolve(<Haul[]>res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  showHaul(event, mode = 'new') {
    this.stateSvc.clearHaul()
    
    if (mode === 'new') {
      this.router.navigate(['new'], { relativeTo: this.route });
    } else {

      this.stateSvc.currentHaul.next(this.selectedRow);
      this.stateSvc.setHaul(this.selectedRow);

      this.router.navigate([this.selectedRow.friendly_trip_id + '/edit'], { relativeTo: this.route });
    }
  }

}

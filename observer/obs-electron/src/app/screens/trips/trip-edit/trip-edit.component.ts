import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  ElementRef
} from '@angular/core';
import { StateService } from '../../../_services/data/state.service';
import { DataService } from '../../../_services/data/data.service';
import {
  FormControl,
  NgForm,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  Validators,
  ValidationErrors
} from '@angular/forms';
import { Route, ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription, Observable, of as obsOf } from 'rxjs';
import { AuthenticationService } from '../../../_services/auth/authentication.service';
import { Vessel, Port, GearType } from 'fram-models';
import { Trip } from '../../../_models/wcgop/trip';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-trip-edit',
  templateUrl: './trip-edit.component.html',
  styleUrls: ['./trip-edit.component.scss']
})
export class TripEditComponent implements OnInit, OnChanges {
  // For dev purposes, if true, don't save to db
  static DEV_NO_SAVE_TRIP = true;

  @Input() trip: Trip;

  buttonToggled = 'start-trip';

  tripForm: FormGroup;

  isTabletMode: Observable<boolean>;

  partialTrip = false;
  fishProcessed = false;

  vesselNames: string[] = [];
  vesselDocIDs: string[] = [];
  filteredVesselNames: Observable<string[]>;

  currentGearType: Observable<GearType>;
  availableGearTypes = <GearType[]>[];

  @ViewChild('fishery') fisheryRef: ElementRef;

  constructor(
    private authService: AuthenticationService,
    private stateService: StateService,
    private dataService: DataService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.stateService.setStateName('trip-edit');
    this.isTabletMode = this.stateService.tabletMode;
    this.currentGearType = this.stateService.currentGearType;
    this.availableGearTypes = this.stateService.availableGearTypes;
    if (this.trip === undefined) {
      console.log('Got null trip. Creating new one.');
      this.trip = Trip.createWCGOPTrip(this.authService.getCurrentUsername());
    }
    this.stateService.setTrip(this.trip);
    this.rebuildForm();

    // TODO is this the most efficient way to do this?
    this.tripForm.get('partial_trip').valueChanges.subscribe(change => {
      this.partialTrip = change;
    });

    this.tripForm.get('fish_processed').valueChanges.subscribe(change => {
      this.fishProcessed = change;
    });

    this.tripForm.get('gear_type').valueChanges.subscribe(change => {
      this.stateService.currentGearType.next(change);
    });

    this.filteredVesselNames = this.tripForm
      .get('vessel.vessel_name')
      .valueChanges.pipe(
        startWith(''),
        map(val => this.filterVesselNames(val))
      );
  }

  filterVesselNames(val: string): string[] {
    return this.vesselNames.filter(
      option => option.toLowerCase().indexOf(val.toLowerCase()) === 0
    );
  }

  updatedVesselName(name): void {
    if (name && name.length === 1) {
      this.dataService
        .getVesselNames(name)
        .then(names => {
          console.log(
            `Got ${names.rows.length} vessel names starting with ${name}.`
          );
          this.vesselNames = [];
          this.vesselDocIDs = [];
          for (const n of names.rows) {
            this.vesselNames.push(n.value);
            this.vesselDocIDs.push(n.id);
          }
        })
        .catch(err => {
          const errMsg = `Error getting vessel names: ${err}`;
          throw new Error(errMsg);
        });
    } else if (this.vesselNames.indexOf(name) !== -1) {
      const idx = this.vesselNames.indexOf(name);
      this.dataService.get(this.vesselDocIDs[idx]).then(vessel => {
        // Exact match. Set vessel fields accordingly, and jump to Fishery
        this.tripForm.get('vessel.vessel_name').setValue(vessel.vessel_name);
        const registration = vessel.coast_guard_number
          ? vessel.coast_guard_number
          : vessel.state_reg_number;
        this.tripForm.get('vessel.uscg_num_state_reg').setValue(registration);
        this.fisheryRef.nativeElement.focus();
      });
    }
  }

  createForm() {
    this.tripForm = this.fb.group(
      {
        // TODO: could just move all validators into tripValidator, but less convenient
        gear_type: '',
        vessel: this.fb.group({
          vessel_name: ['', [Validators.required, Validators.minLength(2)]],
          uscg_num_state_reg: [
            '',
            [Validators.required, Validators.minLength(2)]
          ]
        }),
        fishery: '',
        skipper: '',
        num_crew: '',
        obs_logbook_num: '',
        licenses_permits: '',
        dates: this.fb.group({
          departure_date: '',
          return_date: ''
        }),
        ports: this.fb.group({
          departure_port_name: '',
          return_port_name: ''
        }),
        partial_trip: false,
        fish_processed: false,
        fishing_days_num: '',
        first_receiver: '',
        vessel_logbook_name: '',
        vessel_logbook_page_num: '',
        fish_tickets: ''
      },
      { asyncValidator: this.overallTripValidator }
    );
  }

  /**
   * Validate trip before allowing submit.
   * This would be useful for "high level" cross referencing etc.
   * Since this is async, returning an observerable via of().
   * @param g FormGroup of trips form
   */
  overallTripValidator(g: FormGroup) {
    // Example:
    // const required = [fishery', 'num_crew'];
    // const errors: ValidationErrors = [];
    // for (const r of required) {
    //   if (g.get(r).value !== null && g.get(r).value.length === 0) {
    //     errors.push({ missing: r });
    //   }
    // }

    // Example:
    // return obsOf(
    //   g.get('vessel_name').value === 'test' ? null : { nottest: true }
    // );

    // TODO this is an example, always returns null for now
    // return obsOf(errors.length > 0 ? errors : null);
    return obsOf(null);
  }

  /**
   * Prepare a trip for saving, using trip object along with formModel values
   */
  prepareSaveTrip(): Trip {
    const formModel = this.tripForm.value;

    const saveTrip: Trip = {
      ...this.trip,
      gear_type: formModel.gear_type,
      vessel: <Vessel>{
        vessel_name: formModel.vessel.vessel_name,
        uscg_num: formModel.vessel.uscg_num_state_reg, // TODO: Determine USCG or state reg?
        state_reg: null
      },
      dates: formModel.dates,
      ports: {
        departure_port: <Port>{
          port_name: formModel.ports.departure_port_name
        }, // TODO actual port from DB
        return_port: <Port>{ port_name: formModel.ports.return_port_name } // TODO actual port from DB
      },
      fishery: formModel.fishery,
      skipper: formModel.skipper,
      num_crew: formModel.num_crew,
      obs_logbook_num: formModel.obs_logbook_num,
      licenses_permits: formModel.licenses_permits, // TODO Array
      partial_trip: formModel.partial_trip ? true : false,
      fish_processed: formModel.fish_processed ? true : false,
      fishing_days_num: formModel.fishing_days_num,
      vessel_logbook_name: formModel.vessel_logbook_name,
      vessel_logbook_page_num: formModel.vessel_logbook_page_num,
      first_receiver: formModel.first_receiver,
      fish_tickets: formModel.fish_tickets // TODO Array
    };
    return saveTrip;
  }

  rebuildForm() {
    // Rebuild form from current trip model
    this.tripForm.reset(this.trip);

    // TODO: Verify this is complete
    this.tripForm.patchValue({
      vessel: { uscg_num_state_reg: this.trip.vessel.uscg_num },
      ports: {
        departure_port_name: this.trip.ports.departure_port.port_name,
        return_port_name: this.trip.ports.return_port.port_name
      }
    });
  }

  onSubmit() {
    this.trip = this.prepareSaveTrip();
    if (!TripEditComponent.DEV_NO_SAVE_TRIP) {
      this.dataService.put(this.trip.id, this.trip).then(result => {
        console.log('Saved trip document', this.trip.id);
      });
    }
    this.stateService.setTrip(this.trip);
    this.rebuildForm();
  }

  onCancelBack() {
    // If cancel and trip isn't populated, clear current trip
    if (this.tripForm.invalid) {
      this.stateService.clearTrip();
    }
    this.router.navigate(['/trips']);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.rebuildForm();
  }
}

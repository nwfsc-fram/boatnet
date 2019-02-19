import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  ElementRef } from '@angular/core';
import { StateService } from '../../../_services/data/state.service';
import { Trip } from '../../../_models/wcgop/trip';
import { Haul } from '../../../_models/wcgop/haul';
import { Vessel } from 'bn-models';
import { Location } from 'bn-models';
import { DataService } from '../../../_services/data/data.service';
import {
  FormControl,
  NgForm,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  Validators,
  ValidationErrors } from '@angular/forms';
import { Route, ActivatedRoute, Params, Router } from '@angular/router';
import * as _moment from 'moment';
import { Subscription, Observable, of as obsOf } from 'rxjs';
import { AuthService } from 'bn-auth';
import { Port } from 'bn-models';
import { GearType } from 'bn-models';
import { startWith, map } from 'rxjs/operators';


@Component({
  selector: 'app-haul-edit',
  templateUrl: './haul-edit.component.html',
  styleUrls: ['./haul-edit.component.scss']
})

export class HaulEditComponent implements OnInit {

  displayDialog = false;
  deleteConfirm = false;

  selectedRow: Location;
  compiledTime: Date;

  cols: any[];

  locations: Location[] = [
    // tslint:disable-next-line:max-line-length
    {id: '0', type: 'location', created_by: 'Seth Gerou', created_date: 'Fri Jul 13 2018 13:27:44 GMT-0800', location_type: 'set', date_time: 'Fri Jul 13 2018 13:27:44 GMT-0800', lat: "+31°12.12'", lon: "-122°35.32'", fishing_depth: '123', bottom_depth: '456'},
    {id: '1', type: 'location', created_by: 'Seth Gerou', created_date: 'Thu Jul 12 2018 13:27:44 GMT-0700', location_type: 'up', date_time: 'Thu Jul 12 2018 13:27:44 GMT-0700', lat: '47.65725', lon: '123.56774', fishing_depth: '123', bottom_depth: '456'},
    {id: '2', type: 'location', created_by: 'Seth Gerou', created_date: 'Thu Jul 12 2018 13:27:44 GMT-1000', location_type: 'type1', date_time: 'Thu Jul 12 2018 13:27:44 GMT-1000', lat: '47.65725', lon: '123.56774', fishing_depth: '123', bottom_depth: '456'}
  ];

  time_zones = [
    { label: 'Aleutian', value: '-10' },
    { label: 'Alaska', value: '-9' },
    { label: 'Pacific', value: '-8' },
    { label: 'Mountain', value: '-7' },
    { label: 'Central', value: '-6' },
    { label: 'Eastern', value: '-5' },
  ];

  displayOptions = {
    gear_perf: true,
  };

  haulId = "17"

  exampleSpecies = [
    {label: ''},
    {label: 'Aholehole'},
    {label: 'Airbreathing catfish'},
    {label: 'Airsac catfish'},
    {label: 'Alaska blackfish'},
    {label: 'Albacore'},
    {label: 'Alewife'},
    {label: 'Alfonsino'},
    {label: 'Algae eater'},
    {label: 'Alligatorfish'},
    {label: 'Alligator gar'},
    {label: 'Amberjack - Seriola dumerili'},
    {label: 'American sole'},
    {label: 'Amur pike'},
    {label: 'Anchovy'},
    {label: 'Anemonefish'},
    {label: 'Angelfish'},
    {label: 'Angler'},
    {label: 'Angler catfish'},
    {label: 'Anglerfish'},
    {label: 'Antarctic cod'},
    {label: 'Antarctic icefish'},
    {label: 'Antenna codlet'},
    {label: 'Arapaima'},
    {label: 'Archerfish'},
    {label: 'Arctic char'},
    {label: 'Armored gurnard'},
    {label: 'Armored searobin'},
    {label: 'Armorhead'},
    {label: 'Armorhead catfish'},
    {label: 'Armoured catfish'},
    {label: 'Arowana'}
    ];

  static DEV_NO_SAVE_HAUL = true;
  isTabletMode: Observable<boolean>;
  currentProgram: string;
  currentGearType: string;

  locationForm: FormGroup;

  locationId: string;

  haulForm: FormGroup;

  gearTypesData = this.stateService.availableGearTypes;
  gearTypes = [];

  tripData: Trip;

  haul: Haul;

  targetStrategies = [
    { value: '1', desc: 'Strategy 1' },
    { value: '2', desc: 'Strategy 2' },
    { value: '3', desc: 'Strategy 3' }
  ];

  wms = [
    { value: 14, label: '14'},
    { value: 6, label: '6'},
    { value: 22, label: '...'}
  ];

  perfOptions = [
    { value: 1, label: '1', desc: 'No problem'},
    { value: 2, label: '2', desc: 'Problem - crab pot was in the haul'},
    { value: 3, label: '3', desc: 'Problem - net hung up'},
    { value: 4, label: '4', desc: 'Problem - net ripped'},
    { value: 5, label: '5', desc: 'Problem - trawl net or codend lost'},
    { value: 6, label: '6', desc: 'Shortwiring'},
    { value: 7, label: '7', desc: 'Problem - other'}
  ];

  options = [
    { value: 1, label: 'option 1'},
    { value: 2, label: 'option 2'},
    { value: 3, label: 'option 3'}
  ];

  beaufortScaleOptions = [
    {value: 0, label: '0', desc: 'Sea (glassy, calm) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 1, label: '1', desc: 'Sea (light ripple) - Wind (1-4 kts, light air) - Wave Height (.25ft)'},
    {value: 2, label: '2', desc: 'Sea (small wavelets) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 3, label: '3', desc: 'Sea (scattered whitecaps) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 4, label: '4', desc: 'Sea (small waves, frequent whitecaps) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 5, label: '5', desc: 'Sea (moderate waves, many whitecaps) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 6, label: '6', desc: 'Sea (all whitecaps, some spray) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 7, label: '7', desc: 'Sea (breaking waves, spindrift) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 8, label: '8', desc: 'Sea (medium high waves, foamy streaks) - Wind (0-1 kts, calm) - Wave Height (flat)'},
    {value: 9, label: '9', desc: 'Sea (high waves, dense foamy streaks) - Wind (0-1 kts, calm) - Wave Height (flat)'},
  ];

  booleanValues = [
    {value: true, label: 'Y'},
    {value: false, label: 'N'}
  ];

  emObsOptions = [
    {value: 0, label: 'EM'},
    {value: 1, label: 'Observer'}
  ];

  location_types = [
    {value: 0, label: "set"},
    {value: 1, label: "up"},
    {value: 2, label: "type1"}
  ]

  constructor(
    private authService: AuthService,
    private stateService: StateService,
    private dataSvc: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.createForm();
    this.createLocationForm();
  }

  ngOnInit() {
    this.stateService.setStateName('haul-edit');
    this.isTabletMode = this.stateService.tabletMode;

    this.tripData = this.stateService.currentTrip.getValue();

    this.stateService.setTrip(this.tripData);
    this.route.params.subscribe((params: Params) => {
      // this.id = +params['id'];
      // this.editMode = params['id'] != null;
      console.log('Params:', params);
      console.log(params.id)
    });

    this.haul = this.stateService.currentState.haul;
    console.log("this.haul is:" + this.haul)
    console.log(this.haul === undefined)

    if (this.haul === undefined) {
      console.log('Got NULL HAUL. Creating new one.');
      this.haul = Haul.createWCGOPHaul(this.authService.getCurrentUsername());
    }

    this.stateService.setHaul(this.haul);

    this.currentProgram = this.stateService.currentProgram.getValue().desc;
    console.log(this.stateService.currentGearType);

    for (const gearType of this.gearTypesData) {
      this.gearTypes.push( { label: gearType.desc, value: gearType.desc } );
    }

    console.log(this.haul)
    this.createEditForm()

    this.cols = [
      { field: 'location_type', header: 'Type', width: '3%'},
      { field: 'date_time', header: 'Date/Time', width: '8%'},
      { field: 'lat', header: 'Lat', width: '5%'},
      { field: 'lon', header: 'Lon', width: '5%'},
      { field: 'fishing_depth', header: 'Fishing Depth (ftm)', width: '8%'},
      { field: 'bottom_depth', header: 'Bottom Depth (ftm)', width: '8%'}
    ]

  }

  dateChanged(target) {
    console.log(target);
  }

  onCancelBack() {
    this.haulForm.reset();
    this.router.navigate(['/hauls']);
  }

  onUpdateCreateClicked() {
    console.log('implement this');
  }

  createForm() {

    this.haulForm = this.fb.group(
      {
        haul_num: 22,
        otc: null,
        wm: null,
        gear_perf: null,
        target_strategy: null,
        gear_type: null,
        start_date: null,
        end_date: null,
        otc_wt: null,
        observer_catch_estimate: null,
        vessel_catch_estimate: null,
        errors: null,
        bio_list: Math.floor( (Math.random() * 3 ) + 1 ),  // needs awareness of other hauls
        haul_sampled: null,
        beaufort_scale: null,
        brd_present: null,
        seabird_avoidance: null,
        efp: null,
        total_hookspots_set: null,
        num_hookspots_lost: null,
        avg_soak_time: null,
        locations: null,
        vessel_type: null,
        delivery_vessel_id: null,
        sampled_by: null,
        tribal_code: null,
        percent_marine_mammal_monitored: null,
        sample_type: null,
        sample_design: null,
        sample_unit_type: null,
        estimated_discard_weight: null,
        shortwired: null,
        em_or_observer: null,
        haulback_bird_observation_code: null
      }
    );
  }

  createEditForm() {

    this.haulForm = this.fb.group(
      {
        haul_num: this.haul.haul_num,
        otc: this.haul.otc,
        wm: this.haul.wm,
        gear_perf: this.haul.gear_perf,
        target_strategy: this.haul.target_strategy,
        gear_type: this.haul.gear_type,
        start_date: this.haul.start_date,
        end_date: this.haul.end_date,
        otc_wt: this.haul.testing.otc_wt,
        observer_catch_estimate: this.haul.observer_catch_estimate,
        vessel_catch_estimate: this.haul.vessel_catch_estimate,
        errors: this.haul.testing.errors,
        bio_list: this.haul.bio_list,
        haul_sampled: this.haul.haul_sampled,
        beaufort_scale: this.haul.beaufort_scale,
        brd_present: this.haul.brd_present,
        seabird_avoidance: this.haul.seabird_avoidance,
        efp: this.haul.efp,
        total_hookspots_set: this.haul.total_hookspots_set,
        num_hookspots_lost: this.haul.num_hookspots_lost,
        avg_soak_time: this.haul.avg_soak_time,
        locations: this.haul.locations,
        vessel_type: this.haul.vessel_type,
        delivery_vessel_id: this.haul.delivery_vessel_id,
        sampled_by: this.haul.sampled_by,
        tribal_code: this.haul.tribal_code,
        percent_marine_mammal_monitored: this.haul.percent_marine_mammal_monitored,
        sample_type: this.haul.sample_type,
        sample_design: this.haul.sample_design,
        sample_unit_type: this.haul.sample_unit_type,
        estimated_discard_weight: this.haul.estimated_discard_weight,
        shortwired: this.haul.shortwired,
        em_or_observer: this.haul.em_or_observer,
        haulback_bird_observation_code: this.haul.haulback_bird_observation_code
      }
    );
  }

  createLocationForm() {
    this.locationForm = this.fb.group(
      {
        location_type: null,
        date_time: new Date(),
        latitude: null,
        longitude: null,
        fishing_depth: null,
        bottom_depth: null,
        time: new Date().getHours() + ':' + new Date().getMinutes(),
      }
    );
  }

  createEditLocationForm() {
    console.log('selected row: ' + this.selectedRow);
    const activeLocation = this.selectedRow;
    console.log(activeLocation);
    this.locationForm = this.fb.group(
      {
        location_type: this.getLocationTypeValue(activeLocation.location_type),
        id: activeLocation.id,
        date_time: new Date(activeLocation.date_time),
        latitude: activeLocation.lat,
        longitude: activeLocation.lon,
        fishing_depth: activeLocation.fishing_depth,
        bottom_depth: activeLocation.bottom_depth,
        time: new Date(activeLocation.date_time).getHours() + ':' + new Date(activeLocation.date_time).getMinutes(),
      }
    );
  }

  onGearSelect(event) {
    this.stateService.currentGearType.next(event.value);
    this.currentGearType = event.value;
    this.displayOptions.gear_perf = this.currentGearType === "Fixed Gear" ? true : false
    console.log(this.stateService.currentGearType.value);
  }

  getGearPerfDescription(value) {
      const selectedPerf = this.perfOptions.find(function(x) {
        return x.value === value;
      });
      if (selectedPerf) {
        return selectedPerf.desc;
      } else {
        return '';
      }
  }

  getBeaufortScaleDescription(value) {
    const selectedBeaufort = this.beaufortScaleOptions.find(function(x) {
      return x.value === value;
    });
    if (selectedBeaufort) {
      return selectedBeaufort.desc;
    } else {
      return '';
    }
  }

  getLocationTypeValue(label) {
    const selectedLocationType = this.location_types.find(function(x) {
      return x.label === label;
    })
      return selectedLocationType.value;
  }

  showLocationDialog(mode = 'new') {
    if (mode === 'new') {
      this.createLocationForm();
      this.displayDialog = true;
    } else if (mode === 'edit') {
      if (this.selectedRow) {
      this.createEditLocationForm();
      this.displayDialog = true;
    }
  }
}

showDeleteConfirmation() {
  console.log(this.selectedRow);
  if (this.selectedRow) {
    this.deleteConfirm = true;
  }
}

onCancelAddEdit() {
  this.displayDialog = false;
  this.locationForm.reset();
  console.log(this.locations.length);
}

logChanges() {
  console.log(this.locationForm.value);
}

onCancelDelete() {
  this.deleteConfirm = false;
}

onDelete() {
  this.locations.splice(this.locations.indexOf(this.selectedRow), 1);
  this.deleteConfirm = false;
  this.selectedRow = null;
}

onLocationSubmit() {

  this.locationId = String(parseInt(this.locations[this.locations.length - 1].id) + 1);
  const formModel = this.locationForm.value;
  this.compiledTime = formModel.date_time;
  if (formModel.time) {
    this.compiledTime.setHours(parseInt(formModel.time.substring(0,2)));
    this.compiledTime.setMinutes(parseInt(formModel.time.substring(3,5)));
  }

  if (formModel.id) {
    console.log('has ID');
    const locationId = formModel.id ;

    const edited = this.locations.find(function(x) { return x.id === locationId; });
    this.locations.splice(this.locations.indexOf(edited), 1);
    this.locationId = formModel.id;
  }

  const saveLocation = new Location()
  saveLocation.id = this.locationId
  saveLocation.type = 'location'
  saveLocation.created_by = this.authService.getCurrentUsername()
  saveLocation.created_date = String(new Date())
  saveLocation.location_type = 'set'
  saveLocation.date_time = String(this.compiledTime)
  saveLocation.lat = formModel.latitude
  saveLocation.lon = formModel.longitude
  saveLocation.fishing_depth = formModel.fishing_depth
  saveLocation.bottom_depth = formModel.bottom_depth

  this.locations.push(
    saveLocation
  );
  this.displayDialog = false;

  this.selectedRow = null;
}

onTabChange(event) {
  if (event.originalEvent.srcElement.innerText === "Haul Locations") {
    console.log(event.originalEvent.srcElement.innerText)
  } else {
    this.selectedRow = null;
  }
}

}

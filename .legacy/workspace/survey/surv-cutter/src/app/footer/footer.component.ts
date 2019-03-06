import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../_models/shared/user';
import { AcousticHaul } from '../_models/acoustic/acoustic-haul';
import { AcousticAppConfig } from '../_models/acoustic/acoustic-app-config';
import { StateService } from '../_services/state.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentScreen = new BehaviorSubject<string>(undefined);
  version: string;
  showVersion = true;
  showHome = true;
  spacing = '60px';

  constructor(private stateService: StateService) {}

  ngOnInit() {
    this.version = '0.0.0';
    this.currentScreen = this.stateService.currentScreen;
  }
  setType(value: string) {
    console.log('type = ' + value);
    if (value.indexOf('wcgop') > -1) {
      if (value.indexOf('trawl') > -1) {
        this.stateService.setAppConfig('observer', 'wcgop', 'trawl');
      } else if (value.indexOf('fixedgear') > -1) {
        this.stateService.setAppConfig('observer', 'wcgop', 'fixedgear');
      }
    } else if (value.indexOf('ashop') > -1) {
      this.stateService.setAppConfig('observer', 'ashop', 'trawl');
    } else if (value.indexOf('hake') > -1) {
      this.stateService.setAppConfig('survey', 'hake', 'trawl');
    }
  }
  addTestHaul() {
    console.log('new haul added');
  }
}

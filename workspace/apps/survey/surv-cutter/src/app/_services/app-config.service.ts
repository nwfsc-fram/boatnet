import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of as observableOf } from 'rxjs';

// Settings
import { Settings, Categories, Programs, Positions } from '../settings';

// App Configurations
import { AcousticAppConfig } from '../_models/acoustic/acoustic-app-config';
// TODO - trawl
// TODO - hookandline
import { WcgopAppConfig } from '../_models/wcgop/wcgop-app-config';
import { AshopAppConfig } from '../_models/ashop/ashop-app-config';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  // category = Settings.category;
  // program = Settings.program;
  // position = Settings.position;

  category = new BehaviorSubject<any>(undefined);
  program = new BehaviorSubject<any>(undefined);
  position = new BehaviorSubject<any>(undefined);

  config = new BehaviorSubject<any>(undefined);

  constructor() {
    this.category.next(Settings.category);
    this.program.next(Settings.program);
    this.position.next(Settings.position);
    this.configureApp();
  }
  configureApp(newCategory?: Categories, newProgram?: Programs) {
    if (newCategory) {
      this.category.next(newCategory);
    }
    if (newProgram) {
      this.program.next(newProgram);
    }
    switch (this.category.getValue()) {
      case Categories.Survey: // Surveys
        switch (this.program.getValue()) {
          case Programs.Hake:
            this.config.next(AcousticAppConfig); // AcousticAppConfig.createAcousticAppState();
            break;
          case Programs.Trawl:
            break;
          case Programs.HookAndLine:
            break;
        }
        break;
      case Categories.Observer: // Observer
        switch (this.program.getValue()) {
          case Programs.WCGOP:
            this.config.next(WcgopAppConfig); // WcgopAppConfig.createWcgopAppState();
            break;
          case Programs.ASHOP:
            this.config.next(AshopAppConfig); // AshopAppConfig.createAshopAppState();
            break;
        }
        break;
    }
  }
}

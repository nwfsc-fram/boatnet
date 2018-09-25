import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { User } from '../_models/shared/user';
import { Subscription, Observable } from 'rxjs';

import { AuthenticationService } from '../_services/auth/authentication.service';
import { StateService } from '../_services/data/state.service';
import { AppState } from '../_models/wcgop/app-state';
import { DataService } from '../_services/data/data.service';

const pkg = require('../../../package.json');
const dbConfig = require('../_services/dbConfig.json');
import { parseDBName } from '../shared/util';
import { Trip } from '../_models/wcgop/trip';

@Component({
  selector: 'app-header-toolbar',
  templateUrl: './header-toolbar.component.html',
  styleUrls: ['./header-toolbar.component.scss']
})
export class HeaderToolbarComponent implements OnInit, OnDestroy {
  isAdmin = false; // todo refactor
  userSub: Subscription;
  stateSub: Subscription;
  programSub: Subscription;

  currentUser: User;
  currentProgramName: string;
  tripSelected: Observable<Trip>;
  version: string;

  currentState: AppState;
  headerStatus: Observable<string>;

  dbName: string;
  showVersion = false;

  showHome = false;

  showTemplateManager = false;
  showTallyPDF = false;
  showBackup = false;
  debug_mode = false;

  constructor(
    private authService: AuthenticationService,
    private stateService: StateService,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.version = this.version = (<any>pkg).version;
    this.currentUser = this.authService.getCurrentUser();
    this.version = this.version = (<any>pkg).version;
    this.dbName = parseDBName((<any>dbConfig).boatnet_url);

    this.userSub = this.authService.getUserObs().subscribe(user => {
      this.currentUser = user;
      this.isAdmin = this.currentUser
        ? this.currentUser.roles.includes('admin')
        : false;
    });

    this.stateSub = this.stateService.getState().subscribe(state => {
      this.handleStateChange(state);
    });

    this.headerStatus = this.stateService.headerStatus;

    this.tripSelected = this.stateService.currentTrip;

    this.programSub = this.stateService.currentProgram.subscribe(program => {
      if (program) {
        this.currentProgramName = program.desc;
      }
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.stateSub.unsubscribe();
    this.programSub.unsubscribe();
  }

  logOut() {
    this.dataService.disconnectDB();
    this.authService.logout();
    this.stateService.clearTrip();
  }

  /**
   * Show various menu items, depending on app state.
   * TODO: Reorganize this before it gets huge
   * @param state Full app state
   */
  handleStateChange(state: AppState) {
    this.currentState = state;

    // default to false for simplicity
    this.showHome = false;
    this.showVersion = false;
    this.showTemplateManager = false;
    this.showTallyPDF = false;
    this.showBackup = false;

    switch (this.currentState.name) {
      case 'login':
        this.showVersion = true;
        break;
      case 'home':
        this.showBackup = true;
        break;
      case 'trips':
      case 'hauls':
        this.showHome = true;
        this.showBackup = true;
        break;
      case 'tally':
        this.showHome = true;
        this.showTemplateManager = true;
        this.showBackup = true;
        this.showTallyPDF = true;
        break;
      case 'settings':
        this.showHome = true;
        this.showVersion = true;
        this.showBackup = true;
        break;
      default:
        break;
    }
  }

  onShowTemplateMgr() {
    this.stateService.menuTriggered.next('template-manager');
  }
}

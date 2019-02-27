import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';

// Test
import { TestModel } from '@boatnet/bn-models';
import { DataService } from '../../_services/data/data.service';
import { AuthService } from '@boatnet/bn-auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tripActive = false;
  isTabletMode: Observable<boolean>;

  isElectron: boolean;

  testModel: TestModel;

  constructor(
    private stateSvc: StateService,
    private dataService: DataService,
    private authService: AuthService,
    private electronService: ElectronService
  ) {
    this.isElectron = this.electronService.isElectronApp;
  }

  ngOnInit() {
    this.stateSvc.setStateName('home');
    this.isTabletMode = this.stateSvc.tabletMode;
    if (!this.dataService.initialSyncComplete.getValue()) {
      // TODO temp store pw or use couchdb cookie
      this.dataService.connectDatabase(this.authService.getCurrentUser(), '');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tripActive = false;
  isTabletMode: Observable<boolean>;

  isElectron: boolean;
  constructor(
    private stateSvc: StateService,
    private electronService: ElectronService
  ) {
    this.isElectron = this.electronService.isElectronApp;
  }

  ngOnInit() {
    this.stateSvc.setStateName('home');
    this.isTabletMode = this.stateSvc.tabletMode;
  }
}

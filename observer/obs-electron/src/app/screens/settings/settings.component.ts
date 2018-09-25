import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { ThemeService } from '../../_services/ui/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  location: Location;
  tabletMode: Observable<boolean>;
  isDarkTheme: Observable<boolean>;

  constructor(
    private stateSvc: StateService,
    private loc: Location,
    private themeService: ThemeService
  ) {
    this.location = this.loc;
  }

  ngOnInit() {
    this.stateSvc.setStateName('settings');
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.tabletMode = this.stateSvc.tabletMode;
  }

  onBack() {
    this.location.back();
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  toggleTabletMode(checked) {
    this.stateSvc.setTabletMode(checked);
  }

}

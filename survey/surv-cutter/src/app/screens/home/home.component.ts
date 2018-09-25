import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/state.service';
import { ThemeService } from '../../_services/theme.service';
import { Observable } from 'rxjs';
import { AcousticHaul } from '../../_models/acoustic/acoustic-haul';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isTabletMode: Observable<boolean>;
  isDarkTheme: Observable<boolean>;
  currentHaul = new Observable<AcousticHaul>(undefined);

  constructor(
    private stateService: StateService,
  ) {}

  ngOnInit() {
    this.currentHaul = this.stateService.currentHaul;
    this.isTabletMode = this.stateService.tabletMode;

  }

  toggleTabletMode(checked) {
    // Emit a tablet mode change, through the state service
    this.stateService.setTabletMode(checked);
  }

}

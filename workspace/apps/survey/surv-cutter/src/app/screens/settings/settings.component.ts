import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/state.service';
import { Categories, Programs, Positions } from '../../settings';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(private stateService: StateService) {}

  ngOnInit() {}

  onValChange(value: string) {
    console.log('new value=' + value);
    this.stateService.appConfig.getValue();
  }
}

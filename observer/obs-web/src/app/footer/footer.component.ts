import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { AppState } from '../_models/app-state';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  name: string;
  searchConfig = ['trips', 'user-management', 'vessel-management', 'permits-management']
  createConfig = ['user-management', 'vessel-management', 'permits-management', 'trips']
  confirmConfig = ['user-preferences', 'ots-management']

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit() {
    this.name = this.stateService.currentState.name

  }

}

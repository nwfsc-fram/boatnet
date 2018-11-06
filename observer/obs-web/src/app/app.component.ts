import { Component, OnInit } from '@angular/core';
import { StateService } from './state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private stateService: StateService


  ) 
  {}

  ngOnInit() {
    console.log("CURRENT STATE:::::::: ")
    console.log(this.stateService.getState())
  }


}

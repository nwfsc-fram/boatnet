import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../../_services/ui/alert.service';
import { DataService } from '../../_services/data/data.service';
import { User } from 'bn-models';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/app-state';
import { Subscription, Observable } from 'rxjs';
import { Program } from 'bn-models';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from 'bn-auth';

@Component({
  moduleId: module.id,
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model: any = {};
  loading = false;
  hide = true;
  returnUrl: string;
  currentUserProgram: Program; // TODO: Actual user programs from Auth service
  availablePrograms = [];

  isTabletMode: Observable<boolean>;
  isDarkTheme: Observable<boolean>;

  isDBSynced: Observable<boolean>;

  loginResult$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    // reset login status
    this.authService.logout();
    // Todo NgRx AppState
    this.stateService.setState(<AppState>{ name: 'login' });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  }

  changedUsername(event$) {}

  login() {
    this.loading = true;
    const username = this.model.username;
    const pw = this.model.password;
    this.authService.login(username, pw).subscribe(
      result => {
        console.log('Logged in as', result.username);
        // if (!this.dataService.initialSyncComplete.getValue()) {
        //   this.dataService.connectDatabase(
        //     this.model.username,
        //     this.model.password
        //   );
        // }
        this.router.navigate([this.returnUrl]);
      },
      loginError => {
        this.loading = false;
        this.alertService.error(loginError);
        console.error(loginError);
      }
    );
  }

}


// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss']
// })
// export class LoginComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }

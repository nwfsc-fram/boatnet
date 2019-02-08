import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../../_services/ui/alert.service';
import { DataService } from '../../_services/data/data.service';
import { User } from 'bn-models';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/wcgop/app-state';
import { Subscription, Observable } from 'rxjs';
import { ThemeService } from '../../_services/ui/theme.service';
import { Program } from 'bn-models';
import { ElectronService } from 'ngx-electron';
import { ConfirmationService } from 'primeng/api';
import { AuthService, BoatnetUser, LoginResult } from 'bn-auth';

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
    public electronService: ElectronService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private stateService: StateService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // reset login status
    this.authService.logout();
    // Todo NgRx AppState
    this.stateService.setState(<AppState>{ name: 'login' });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isTabletMode = this.stateService.tabletMode;
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.isDBSynced = this.dataService.initialSyncComplete;
  }

  changedUsername(event$) {}

  toggleTabletMode(checked) {
    // Emit a tablet mode change, through the state service
    this.stateService.setTabletMode(checked);
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  async login() {
    this.loading = true;
    const username = this.model.username;
    const pw = this.model.password;
    const result: LoginResult = await this.authService.login(username, pw);
    console.log('Got Result', result);
    if (result.error) {
      this.alertService.error(result.error);
      this.loading = false;
      return;
    } else {
      console.log('Logged in as', result.user.user);
      this.router.navigate([this.returnUrl]);
    }
    // this.authenticationService
    //   .login(this.model.username, this.model.password)
    //   .subscribe(
    //     data => {
    //       if (!this.dataService.initialSyncComplete.getValue()) {
    //         this.dataService.connectDatabase(
    //           this.model.username,
    //           this.model.password
    //         );
    //       }
    //       this.stateService.setProgram(this.currentUserProgram);
    //       this.router.navigate([this.returnUrl]);
    //     },
    //     error => {
    //       this.alertService.error(error);
    //       this.loading = false;
    //     }
    //   );
  }

  onExitElectron() {
    if (this.electronService.isElectronApp) {
      this.confirmationService.confirm({
        header: 'Exit Application',
        message: 'Exit the application?',
        accept: () => {
          this.electronService.ipcRenderer.send('close-app');
        }
      });
    } else {
      console.log('Not an electron app, not exiting.');
    }
  }
}

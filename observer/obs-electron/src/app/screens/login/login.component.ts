import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AlertService } from '../../_services/ui/alert.service';
import { AuthenticationService } from '../../_services/auth/authentication.service';
import { DataService } from '../../_services/data/data.service';
import { User } from 'fram-models';
import { StateService } from '../../_services/data/state.service';
import { AppState } from '../../_models/wcgop/app-state';
import { Subscription, Observable } from 'rxjs';
import { ThemeService } from '../../_services/ui/theme.service';
import { Program } from 'fram-models';
import { ElectronService } from 'ngx-electron';
import { ConfirmationService } from 'primeng/api';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    public electronService: ElectronService,
    private alertService: AlertService,
    private confirmationService: ConfirmationService,
    private dataService: DataService,
    private stateService: StateService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // reset login status
    this.authenticationService.logout();
    this.stateService.setState(<AppState>{ name: 'login' });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    this.isTabletMode = this.stateService.tabletMode;
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.isDBSynced = this.dataService.initialSyncComplete;
  }

  toggleTabletMode(checked) {
    // Emit a tablet mode change, through the state service
    this.stateService.setTabletMode(checked);
  }

  toggleDarkTheme(checked: boolean) {
    this.themeService.setDarkTheme(checked);
  }

  changedUsername(username) {
    this.authenticationService.validateUsername(username).then(valid => {
      if (valid) {
        this.availablePrograms = this.authenticationService.checkPrograms(
          username
        );
        if (this.availablePrograms.length > 0) {
          this.currentUserProgram = this.availablePrograms.slice(-1)[0];
        }
      } else {
        this.availablePrograms = [];
      }
    });
  }

  changedProgram(program) {
    this.stateService.currentProgram.next(program);
  }

  login() {
    this.loading = true;
    this.authenticationService
      .login(this.model.username, this.model.password)
      .subscribe(
        data => {
          if (!this.dataService.initialSyncComplete.getValue()) {
            this.dataService.connectDatabase(
              this.model.username,
              this.model.password
            );
          }
          this.stateService.setProgram(this.currentUserProgram);
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        }
      );
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

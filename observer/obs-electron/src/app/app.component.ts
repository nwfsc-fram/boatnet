import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { DataService } from './_services/data/data.service';
import { AlertService } from './_services/ui/alert.service';
import { Subscription, Observable } from 'rxjs';
import { ThemeService } from './_services/ui/theme.service';
import * as electron from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Observer NG';
  isDarkTheme: Observable<boolean>;
  syncSub: Subscription;

  constructor(
    public electronService: ElectronService,
    private database: DataService,
    private alertService: AlertService,
    private themeService: ThemeService
  ) {}

  // https://github.com/ThorstenHans/ngx-electron has electron service details

  /**
   * TODO: Autoupdate messages could be more elegant, progress bar etc.
   */
  private updateStatus(message) {
    setTimeout(() => {
      this.alertService.success(message);
    }, 1000);
  }

  public ngOnInit() {
    if (this.electronService.isElectronApp) {
      console.log('Electron Mode');
      this.electronService.ipcRenderer.on('message', (event, arg) => {
        console.log('Got Message:', arg);
        switch (arg) {
          case 'update-not-available':
            // this.updateStatus('Software is up-to-date.');
            break;
          case 'update-available':
            this.updateStatus('Update available. Downloading...');
            break;
          case 'update-downloaded':
            this.updateStatus('Update downloaded. Installing in 5 seconds');
            break;
          case 'error-auto-updater':
            // Show offline icon?
            break;
        }
      });
    } else {
      console.log('Web Mode');
    }

    this.syncSub = this.database.initialSyncComplete.subscribe(complete => {
      if (complete) {
        this.alertService.success('Database Synchronized.');
      }
    });

    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  public ngOnDestroy() {
    this.syncSub.unsubscribe();
  }
}

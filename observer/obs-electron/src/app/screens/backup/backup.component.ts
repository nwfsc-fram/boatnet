import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { StateService } from '../../_services/data/state.service';
import { DataService } from '../../_services/data/data.service';
import { saveAs as importedSaveAs } from 'file-saver';
import { getBoatnetDateNow } from '../../shared/util';
import { ElectronService } from 'ngx-electron';

import * as fs from 'fs';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {
  location: Location;
  isLoading = false;
  isElectron = false;

  constructor(
    private loc: Location,
    private stateService: StateService,
    private dataService: DataService,
    private electronService: ElectronService
  ) {
    this.location = this.loc;
    this.isElectron = this.electronService.isElectronApp;
  }

  onBack() {
    this.location.back();
  }

  ngOnInit() {
    this.stateService.setStateName('settings');
  }

  onBackup() {
    if (this.isElectron) {
      this.backupElectron();
    } else {
      this.backupWeb();
    }
  }

  private backupWeb() {
    const fileDate = getBoatnetDateNow().replace(new RegExp('-', 'g'), '');
    this.isLoading = true;
    this.dataService.getAllDocs().then( docs => {
      this.isLoading = false;
      const data = new Blob([docs], {
        type: 'text/plain'
      });
      importedSaveAs(data, `backup-${fileDate}.json`);
    }).catch(err => {
      this.isLoading = false;
    });
  }

  private backupElectron() {
    // TODO: push this via IPC to create directories etc
    const fileDate = getBoatnetDateNow().replace(new RegExp('-', 'g'), '');
    this.isLoading = true;
    this.dataService.getAllDocs().then( docs => {
      this.isLoading = false;
      const data = new Blob([docs], {
        type: 'text/plain'
      });
      importedSaveAs(data, `backup-${fileDate}.json`);
    }).catch(err => {
      this.isLoading = false;
    });

  }
}

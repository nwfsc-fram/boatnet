import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-redirect-download',
  template: 'Redirecting to...'
})
export class RedirectDownloadComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // <protocol>//<hostname>:<port>/
    const OBS_ELECTRON_FILENAME = 'Observer%20NG%20Setup%200.0.26+179.exe';
    const loc = window.location;
    const obs_location =
      loc.protocol +
      '//' +
      loc.hostname +
      ':' +
      loc.port +
      '/' +
      OBS_ELECTRON_FILENAME;
    console.log('Redirecting to obs-electron download.');
    window.location.href = obs_location;
  }
}

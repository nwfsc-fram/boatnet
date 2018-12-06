import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// https://grensesnittet.computas.com/dynamic-themes-in-angular-material/
@Injectable()
export class ThemeService {
  private _darkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme = this._darkTheme.asObservable();

  setDarkTheme(isDarkTheme: boolean) {
    this._darkTheme.next(isDarkTheme);
  }
}

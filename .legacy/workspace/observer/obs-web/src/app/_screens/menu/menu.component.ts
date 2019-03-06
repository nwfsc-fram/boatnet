import { Component, OnInit } from '@angular/core';
import { AuthService } from 'bn-auth';
import { DataService } from '../../_services/data/data.service'
import { Observable } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  loggedIn = this.authService.isLoggedIn()

  constructor(
    private dataService: DataService,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  logOut() {
    this.authService.logout();
  }

}


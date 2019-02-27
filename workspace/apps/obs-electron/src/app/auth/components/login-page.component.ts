import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromStore from '../../state';
import { Login } from '../actions/auth.actions';
import { Credentials } from '../models/authentication.model';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {
  error$ = this.store.select(fromStore.selectLoginPageError);
  pending$ = this.store.select(fromStore.selectLoginPagePending);

  constructor(private store: Store<fromStore.State>) {}

  ngOnInit() {}

  onLogin(credentials: Credentials) {
    this.store.dispatch(new Login(credentials));
  }
}

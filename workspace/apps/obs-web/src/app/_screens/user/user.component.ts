import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';
import { User } from '../../_models/user';
import {
  FormControl,
  NgForm,
  FormGroup,
  FormBuilder,
  ValidatorFn,
  Validators,
  ValidationErrors
} from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  user: User;

  userForm: FormGroup;

  name = this.stateSvc.currentState.name;

  constructor(private stateSvc: StateService, private fb: FormBuilder) {
    this.createForm();
  }

  ngOnInit() {
    // this.stateSvc.setStateName('user');
    this.user = this.stateSvc.currentState.user;

    if (this.stateSvc.currentState.user === undefined) {
      this.user = User.createUser();
    }

    this.createEditForm();
  }

  createForm() {
    this.userForm = this.fb.group({
      id: null,
      first_name: null,
      last_name: null,
      email: null,
      home: null,
      role: null,
      vessel: null,
      mobile: null,
      address: null,
      city: null,
      state: null,
      zip: null,
      home_port: null
    });
  }

  createEditForm() {
    this.userForm = this.fb.group({
      id: this.user.id,
      first_name: this.user.first_name,
      last_name: this.user.last_name,
      email: this.user.email,
      home: this.user.home,
      role: this.user.role,
      vessel: this.user.vessel,
      mobile: this.user.mobile,
      address: this.user.address,
      city: this.user.city,
      state: this.user.state,
      zip: this.user.zip,
      home_port: this.user.home_port
    });
  }
}

import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Credentials } from '../models/authentication.model';

@Component({
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  selector: 'app-login-form'
})
export class LoginFormComponent implements OnInit {
  @Input() error: string | null;

  @Input() set disabled(isDisabled: boolean) {
    if (isDisabled) {
      this.loginForm.disable();
      this.loading = true;
    } else {
      this.loginForm.enable();
      this.loading = false;
    }
  };

  @Output() submitted = new EventEmitter<Credentials>();

  loading = false;

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  ngOnInit() {}

  submit() {
    const value: Credentials = this.loginForm.value;

    if (this.loginForm.valid) {
      this.submitted.emit(value);
    }
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatInputModule,
  MatButtonModule,
  MatCardModule,
  MatDialogModule
} from '@angular/material';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './effects/auth.effects';
import { LoginPageComponent } from './components/login-page.component';
import { LoginFormComponent } from './components/login-form.component';
import { LogoutPromptComponent } from './components/logout-prompt.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    EffectsModule.forFeature([AuthEffects])
  ],
  declarations: [LoginPageComponent, LoginFormComponent, LogoutPromptComponent],
  entryComponents: [LogoutPromptComponent]
})
export class AuthModule {}

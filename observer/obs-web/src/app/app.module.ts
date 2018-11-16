import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatCardModule,
  MatDialogModule,
  MatListModule,
  MatOptionModule,
  MatSelectModule,
  MatInputModule,
  MatToolbarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSnackBarModule,
  MatMenuModule,
  MatIconModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatButtonToggleModule,
  MatTableModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule
} from '@angular/material';

import { MenuComponent } from './menu/menu.component';
import { VesselPermitsComponent } from './vessel-permits/vessel-permits.component';
import { TripsComponent } from './trips/trips.component';
import { OTSManagementComponent } from './ots-management/ots-management.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { VesselsComponent } from './vessels/vessels.component';
import { PermitsComponent } from './permits/permits.component';
import { TripDetailComponent } from './trip-detail/trip-detail.component';
import { MessagesComponent } from './messages/messages.component';
import { RouterModule, Routes } from '@angular/router';
import { identifierModuleUrl } from '@angular/compiler';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';

const appRoutes: Routes = [
  { path: 'ots-management', component: OTSManagementComponent },
  { path: 'manage-users', component: UserManagementComponent },
  { path: 'trips',      component: TripsComponent },
  { path: 'trip', component: TripDetailComponent },
  { path: 'user-preferences', component: UserPreferencesComponent },
  { path: 'manage-vessels', component: VesselsComponent },
  { path: 'manage-permits', component: PermitsComponent },
  // { path: 'vessel-permits', component: VesselPermitsComponent },
  { path: '',
    redirectTo: 'trips',
    pathMatch: 'full'
  },
];

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    VesselPermitsComponent,
    TripsComponent,
    OTSManagementComponent,
    UserManagementComponent,
    UserPreferencesComponent,
    VesselsComponent,
    PermitsComponent,
    TripDetailComponent,
    MessagesComponent,
    FooterComponent,
    HeaderComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatOptionModule,
    MatSelectModule,
    MatInputModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatTableModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

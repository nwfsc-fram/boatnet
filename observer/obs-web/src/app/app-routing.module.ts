import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './_screens/login/login.component';
import { MenuComponent } from './_screens/menu/menu.component';
import { VesselPermitsComponent } from './_screens/vessel-permits/vessel-permits.component';
import { TripsComponent } from './_screens/trips/trips.component';
import { OTSManagementComponent } from './_screens/ots-management/ots-management.component';
import { UserManagementComponent } from './_screens/user-management/user-management.component';
import { UserConfigComponent } from './_screens/user-config/user-config.component';
import { VesselsComponent } from './_screens/vessels/vessels.component';
import { PermitsComponent } from './_screens/permits/permits.component';
import { TripDetailComponent } from './_screens/trip-detail/trip-detail.component';
import { MessagesComponent } from './_screens/messages/messages.component';
import { FooterComponent } from './_screens/footer/footer.component';
import { HeaderComponent } from './_screens/header/header.component';
import { UserComponent } from './_screens/user/user.component';
import { VesselDetailComponent } from './_screens/vessel-detail/vessel-detail.component';
import { PermitDetailComponent } from './_screens/permit-detail/permit-detail.component';
import { MessageDetailComponent } from './_screens/message-detail/message-detail.component';
import { HomeComponent } from './_screens/home/home.component';
import { OtsTargetDetailComponent } from './_screens/ots-target-detail/ots-target-detail.component';
import { DebrieferComponent } from './_screens/debriefer/debriefer.component';

import { BnAuthModule, AuthService, AuthServiceConfig } from 'bn-auth';
import { AuthGuard } from './_guards/auth.guard';


const appRoutes: Routes = [
  { path: 'home',               component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'ots-management',     component: OTSManagementComponent, canActivate: [AuthGuard] },
  { path: 'ots-target-detail' , component: OtsTargetDetailComponent, canActivate: [AuthGuard] }, 
  { path: 'manage-users',       component: UserManagementComponent, canActivate: [AuthGuard] },
  { path: 'debriefer',          component: DebrieferComponent, canActivate: [AuthGuard] },
  { path: 'user',               component: UserComponent, canActivate: [AuthGuard] },
  { path: 'trips',              component: TripsComponent, canActivate: [AuthGuard] },
  { path: 'trip',               component: TripDetailComponent, canActivate: [AuthGuard] },
  { path: 'message-detail',     component: MessageDetailComponent, canActivate: [AuthGuard] },
  { path: 'user-config',        component: UserConfigComponent, canActivate: [AuthGuard] },
  { path: 'manage-vessels',     component: VesselsComponent, canActivate: [AuthGuard] },
  { path: 'vessel-detail',      component: VesselDetailComponent, canActivate: [AuthGuard] },
  { path: 'manage-permits',     component: PermitsComponent, canActivate: [AuthGuard] },
  { path: 'permit-detail',      component: PermitDetailComponent, canActivate: [AuthGuard] },
  { path: 'login',              component: LoginComponent }, 
  // { path: 'vessel-permits',component: VesselPermitsComponent },
  { path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

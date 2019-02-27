import { NgModule, OnInit } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './screens/home/home.component';
import { HaulsComponent } from './screens/hauls/hauls.component';
import { SpeciesCompositionComponent } from './screens/species-composition/species-composition.component';
import { ReportsComponent } from './screens/reports/reports.component';
import { SerialPortsComponent } from './screens/serial-ports/serial-ports.component';
import { SettingsComponent } from './screens/settings/settings.component';
import { TestComponent } from './screens/test/test.component';
import { Settings } from './settings';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'hauls', component: HaulsComponent },
  // { path: 'speciesComposition', component: SpeciesCompositionComponent, data: {program: this.stateService.appConfig.getValue().catchConfig.cols } },
  { path: 'speciesComposition', component: SpeciesCompositionComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'serialPorts', component: SerialPortsComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'test', component: TestComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

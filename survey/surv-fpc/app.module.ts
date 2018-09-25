import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HaulsComponent } from './screens/hauls/hauls.component';
import { SpeciesCompositionComponent } from './screens/species-composition/species-composition.component';
import { SpecimenSamplingComponent } from './screens/specimen-sampling/specimen-sampling.component';
import { HomeComponent } from './screens/home/home.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    HaulsComponent,
    SpeciesCompositionComponent,
    SpecimenSamplingComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

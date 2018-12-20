import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Home Page - for testing purposes
import { HomeComponent } from './screens/home/home.component';

// bn-modules
import { CatchComponent } from 'bn-catch';
import { SpecimensComponent } from 'bn-specimens';

// PrimeNG Components
import { TreeTableModule } from 'primeng/treetable';
import { PanelModule } from 'primeng/components/panel/panel';
import { ListboxModule } from 'primeng/listbox';
import { SelectButtonModule } from 'primeng/selectbutton';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CatchComponent,
    SpecimensComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TreeTableModule,
    PanelModule,
    ListboxModule,
    SelectButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

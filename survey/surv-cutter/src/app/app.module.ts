// Primary Components
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

// Services
import { StateService } from './_services/state.service';
import { ThemeService } from './_services/theme.service';

// Screens
import { HomeComponent } from './screens/home/home.component';
import { HaulsComponent } from './screens/hauls/hauls.component';
import { SpeciesCompositionComponent } from './screens/species-composition/species-composition.component';
import { SettingsComponent } from './screens/settings/settings.component';
import { ReportsComponent } from './screens/reports/reports.component';
import { SerialPortsComponent } from './screens/serial-ports/serial-ports.component';
import { TestComponent } from './screens/test/test.component';

// Dialogs
import { HaulDialogComponent } from './dialogs/haul-dialog/haul-dialog.component';

// Angular + Material
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MatCardModule,
  MatDialogModule,
  MatListModule,
  MatOptionModule,
  MatSelectModule,
  MatFormField,
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
  MatGridListModule,
  MatTreeModule
} from '@angular/material';

// PrimeNG Components
import { TreeTableModule } from 'primeng/treetable';
import { PanelModule } from 'primeng/components/panel/panel';
import { ListboxModule } from 'primeng/listbox';
import {SelectButtonModule} from 'primeng/selectbutton';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HaulsComponent,
    SpeciesCompositionComponent,
    SettingsComponent,
    ReportsComponent,
    SerialPortsComponent,
    HeaderComponent,
    FooterComponent,
    HaulDialogComponent,
    TestComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatMomentDateModule,
    MatAutocompleteModule,
    MatInputModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatSelectModule,
    MatTableModule,
    MatToolbarModule,
    MatOptionModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatTreeModule,
    CdkTableModule,
    CdkTreeModule,
    MatSidenavModule,
    MatCheckboxModule,
    TreeTableModule,
    PanelModule,
    ListboxModule,
    SelectButtonModule
  ],
  providers: [
    StateService,
    ThemeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

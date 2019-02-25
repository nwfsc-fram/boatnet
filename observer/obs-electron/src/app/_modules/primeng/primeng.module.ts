import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DragDropModule } from 'primeng/dragdrop';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ConfirmDialogModule,
    DragDropModule,
    MessagesModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    ToggleButtonModule,
    SelectButtonModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    InputMaskModule,
    DialogModule,
    TabViewModule
  ],
  exports: [
    ConfirmDialogModule,
    DragDropModule,
    MessagesModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    ToggleButtonModule,
    SelectButtonModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    InputMaskModule,
    DialogModule,
    TabViewModule
  ]
})
export class PrimeNGModule { }

import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from '../../../_services/data/data.service';
import { StateService } from '../../../_services/data/state.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TemplateService } from '../../../_services/data/tally/template.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-template-manager',
  templateUrl: './template-manager.component.html',
  styleUrls: ['./template-manager.component.scss']
})
export class TemplateManagerComponent implements OnInit {

  templateNames: string[];

  selected: any;

  constructor(
    public dialogRef: MatDialogRef<TemplateManagerComponent>,
    private dataService: DataService,
    private stateService: StateService,
    private templateService: TemplateService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.templateService.getTemplateNames().then(names => {
      this.templateNames = names;
    });
  }

  onLoadTemplate() {
    this.confirmationService.confirm({
      header: 'WARNING - CLEARS DATA',
      message: `Load ${this.selected.description} layout and reset tally counts?`,
      accept: () => {
        this.templateService.loadTemplate(this.selected.templateName).then(loadedButtons => {
          this.data = loadedButtons;
          this.dialogRef.close(this.data);
        });
      }
    });
  }
}

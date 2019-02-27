import { Directive, OnInit } from '@angular/core';
import { AlertService } from '../_services/ui/alert.service';
import { MatSnackBar } from '@angular/material';

@Directive({
  selector: 'app-alert'
})
export class AlertDirective implements OnInit {
  message: any;

  constructor(
    private alertService: AlertService,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.alertService.getMessage().subscribe(message => {
      this.message = message;
      if (message) {
        this.snackBar.open(this.message.text, 'Dismiss', {
          duration: 2000
        });
      }
    });
  }
}

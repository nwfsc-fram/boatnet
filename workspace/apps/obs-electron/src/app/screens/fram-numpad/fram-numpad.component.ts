import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-fram-numpad',
  templateUrl: './fram-numpad.component.html',
  styleUrls: ['./fram-numpad.component.scss']
})
export class FramNumpadComponent implements OnInit {
  @Input() showDecimal = true;
  @Input() showOk = true;
  @Input() showAdd = false;

  @Output() keyPress: EventEmitter<string> = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onNumpadKey(event) {
    this.keyPress.emit(event);
  }
}

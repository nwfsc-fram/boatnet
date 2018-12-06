import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { StateService } from '../_services/data/state.service';
import { getBoatnetDateNow } from '../shared/util';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.scss']
})
export class MessageDetailComponent implements OnInit {

  message = new Message;

  letterCount: number = 0;

  constructor(private stateSvc: StateService) { }

  ngOnInit() {
    this.stateSvc.currentState.name = "message-detail"
    if (this.stateSvc.currentState.message) {
      this.message = this.stateSvc.currentState.message
    } else {
      this.message.created_by = this.stateSvc.currentState.user.first_name + " " + this.stateSvc.currentState.user.last_name
      this.message.created_date = getBoatnetDateNow();
      this.stateSvc.setMessage(this.message)
    }
  }

  // updateMessage(event) {
  //   console.log(event.target.value)
  //   this.message.content = event.target.value
  //   this.letterCount = this.message.content.length
  // }

  getMessageLength() {
    if (this.message.content) {
      return this.message.content.length
    } else {
      return "0"
    }
  }

  updateCharCount() {
    this.letterCount = this.message.content.length
  }



}

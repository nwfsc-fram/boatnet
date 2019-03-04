import { Component, OnInit, OnDestroy, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'bn-specimens',
  templateUrl: './specimens.component.html',
  styleUrls: ['./specimens.component.scss']
})
export class SpecimensComponent implements OnInit, OnDestroy, OnChanges {

  sub: any;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    console.log('creating catch');
  }
  ngOnDestroy() {
    console.log('destroying species comp');
  }
  ngOnChanges() {
    console.log('changes a happening...');
  }
}

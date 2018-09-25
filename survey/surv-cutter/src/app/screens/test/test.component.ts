import { Component, OnInit } from '@angular/core';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { SharedModule } from 'primeng/shared';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  // Primeng TreeTable
  data: TreeNode[];
  cols: any[];

  constructor() { }

  ngOnInit() {
    this.data = <TreeNode[]>PRIME_DATA;
    console.log('data = ' + this.data.length);
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'size', header: 'Size' },
      { field: 'type', header: 'Type' }
    ];
  }

}

export interface TreeNode {
  data?: any;
  children?: TreeNode[];
  leaf?: boolean;
  expanded?: boolean;
}

const PRIME_DATA =  [
  {
      'data': {
          'name': 'Documents',
          'size': '75kb',
          'type': 'Folder'
      },
      'children': [
          {
              'data': {
                  'name': 'Work',
                  'size': '55kb',
                  'type': 'Folder'
              },
              'children': [
                  {
                      'data': {
                          'name': 'Expenses.doc',
                          'size': '30kb',
                          'type': 'Document'
                      }
                  },
                  {
                      'data': {
                          'name': 'Resume.doc',
                          'size': '25kb',
                          'type': 'Resume'
                      }
                  }
              ]
          },
          {
              'data': {
                  'name': 'Home',
                  'size': '20kb',
                  'type': 'Folder'
              },
              'children': [
                  {
                      'data': {
                          'name': 'Invoices',
                          'size': '20kb',
                          'type': 'Text'
                      }
                  }
              ]
          }
      ]
  },
  {
      'data': {
          'name': 'Pictures',
          'size': '150kb',
          'type': 'Folder'
      },
      'children': [
          {
              'data': {
                  'name': 'barcelona.jpg',
                  'size': '90kb',
                  'type': 'Picture'
              }
          },
          {
              'data': {
                  'name': 'primeui.png',
                  'size': '30kb',
                  'type': 'Picture'
              }
          },
          {
              'data': {
                  'name': 'optimus.jpg',
                  'size': '30kb',
                  'type': 'Picture'
              }
          }
      ]
  }
];

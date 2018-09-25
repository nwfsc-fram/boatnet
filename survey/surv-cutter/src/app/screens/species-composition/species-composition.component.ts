import { Component, OnInit, OnDestroy, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';

import { SampleData } from './sample-data';

import { StateService } from '../../_services/state.service';
import { Categories, Programs } from '../../settings';

interface Species {
  taxonomyId: number;
  commonName: string;
  scientificName: string;
  visibleName: string;
}

export interface SpeciesCompNode {
  data?: any;
  children?: SpeciesCompNode[];
  leaf?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-species-composition',
  templateUrl: './species-composition.component.html',
  styleUrls: ['./species-composition.component.scss']
})
export class SpeciesCompositionComponent implements OnInit, OnDestroy, OnChanges {

  sub: any;

  opened: Observable<boolean>;
  events: string[] = [];
  speciesList = [];
  mostRecentSpeciesList = [];
  // filteredSpeciesList = new BehaviorSubject<Species[]>([]);
  filteredSpeciesList: Species[];
  speciesFilter: Observable<string>;
  selectedSpeciesComp: SpeciesCompNode;
  selectedSpecies: Species;
  searchedNodes: SpeciesCompNode[];

  dispositions: SelectItem[];
  selectedDisposition: SelectItem;
  weightMethods: SelectItem[];
  selectedWeightMethod: SelectItem;

  // Primeng TreeTable
  appConfig: any;
  program: string;
  grouping: string;
  subgrouping: string;

  data: SpeciesCompNode[];
  cols: any[];
  catchType: any;

  constructor(
    private stateService: StateService,
    private route: ActivatedRoute
  ) {
    this.dispositions = [
      {label: 'R', value: 'Retained'},
      {label: 'D', value: 'Discarded'}
    ];
    this.weightMethods = this.stateService.weightMethods.getValue();
  }

  ngOnInit() {

    console.log('creating species comp');
    this.appConfig = this.stateService.appConfig.getValue().config;
    this.program = this.appConfig.program;
    this.grouping = this.appConfig.catchConfig.grouping;
    this.subgrouping = this.appConfig.catchConfig.subgrouping;
    console.log('program = ' + this.program);
    this.stateService.appConfig.subscribe(v => {
      this.reload(v);
    });
    this.cols = this.appConfig.catchConfig.cols;
    this.catchType = this.appConfig.catchConfig.catchType;
    const testCatch = new this.catchType();
    console.log('testCatch: ' + JSON.stringify(testCatch));

    // this.sub = this.route.data.subscribe(v => console.log('route data: ' + v['program']));

    this.opened = this.stateService.speciesListShown;
    this.speciesList = this.sortAlphabetical(fullSpeciesList);
    this.speciesFilter = this.stateService.speciesFilter;
    this.speciesFilter.subscribe(val => {
      this.filteredSpeciesList = this.filterSpecies(val);
      // this.filteredSpeciesList.next(this.filterSpecies(val));
    });
    // Tree Composition
    this.data = <SpeciesCompNode[]>(SampleData[this.appConfig.program.toLowerCase()]);
  }
  ngOnDestroy() {
    console.log('destroying species comp');
  }
  ngOnChanges() {
    console.log('changes a happening...');
  }
  reload(v: any) {
    const config = v.config;
    this.program = config.program;
    this.grouping = config.catchConfig.grouping;
    this.subgrouping = config.catchConfig.subgrouping;
    this.cols = config.catchConfig.cols;
    this.catchType = config.catchConfig.catchType;
    this.data = <SpeciesCompNode[]>(SampleData[config.program.toLowerCase()]);
  }
  setDisposition(value: string) {
    console.log('disp = ' + value);
  }
  setWeightMethod(value: string) {
    console.log('wm = ' + value);
  }
  filterSpecies(value: string) {
    const temp = this.speciesList.filter(species => species['visibleName'].toLowerCase().indexOf(value.toLowerCase()) === 0);
    const temp2 = this.speciesList.filter(species => species['visibleName'].toLowerCase().indexOf(value.toLowerCase()) > 0);
    return temp.concat(temp2);
  }
  sortAlphabetical(arr: Array<Species>) {
    // https://stackoverflow.com/questions/8996963/how-to-perform-case-insensitive-sorting-in-javascript
    return arr.sort((a, b) => a['visibleName'].localeCompare(b['visibleName'], undefined, {sensitivity: 'base'}));
  }
  setCatch() {
    if (this.selectedSpeciesComp) {
      console.log('catch = ' + this.selectedSpeciesComp.data.species);
    }
    // this.currentCatch = this.selectedSpeciesComp;
  }
  searchSpeciesComp(searchNode: Species, currentNode?: SpeciesCompNode, parentNode?: SpeciesCompNode) {

    // console.log('currentNode = ' + currentNode);
    if (currentNode) {
      console.log(currentNode.data['species'] + ', ' +
       currentNode.data['taxonomyId'] + ' =? ' + searchNode['taxonomyId']);
      // console.log('currentNode: ' + JSON.stringify(currentNode.data));
    }

    if ((currentNode) && (currentNode.data['taxonomyId'] === searchNode['taxonomyId'])) {
      console.log('found the node: ' + currentNode.data['species']);
      return {'currentNode': currentNode, 'parentNode': parentNode};
    }

    let children: SpeciesCompNode[];
    if (parentNode) {           // parentNode exists, not the root level
      if (parentNode.children) {
        children = parentNode.children;
      }
    } else {                    // no parentNode, i.e. root level
      children = this.data;
    }
    for (const node of children) {
      // if (node.data['taxonomyId'] === searchNode['taxonomyId']) {
      //   console.log('found: ' + currentNode.data['species']);
      //   return node;
      // }
      if (node.children) {
        for (const childNode of node.children) {
          this.searchSpeciesComp(searchNode, childNode, node);
        }
      }
    }

    return null;
  }
  addSpecies() {
    if (this.selectedSpecies !== null) {

      // Check if the species already exists in species comp
      if (!this.searchSpeciesComp(this.selectedSpecies)) {
        console.log('species = ' + this.selectedSpecies.commonName);

        // Get the protocol for the species
        const protocol = 'SL100AW25 OvStTi';

        // Create the new species comp record
        const _catch = this.catchType.createCatch(1, this.selectedSpecies.taxonomyId,
           this.selectedSpecies.commonName, protocol, '');
        console.log('_catch = ' + JSON.stringify(_catch));

        // Add it to the TreeTable, sorting it appropriately
        this.data = [...this.data, <SpeciesCompNode>({data: _catch})];

        // const _data = this.dataSource.data;
        // _data.push(new TreeNode(species));
        // this.dataSource.data = _data;

        // Clear the existing selectedSpecies (unhighlight it)
        this.selectedSpecies = null;
      }
    }
  }
  removeSpecies() {
    if (this.selectedSpeciesComp !== null) {
      console.log('remove ' + JSON.stringify(this.selectedSpeciesComp));

      // Check if the species comp entry contains any baskets or specimens
      if (this.isEmpty(this.selectedSpeciesComp)) {

        // const items = this.searchSpeciesComp(this.selectedSpeciesComp.data[''])

        // console.log('parent: ' + this.selectedSpeciesComp.)

        console.log('it is empty... removing it');
        // Remove the species comp item

      }
    }
  }
  isEmpty(item: SpeciesCompNode) {
    // TODO Todd - Check if the species node contains any baskets or children
    //   probably need to actually query the local PouchDB instance to determine if there
    //     are any specimens, specialprojects, or baskets

    if ((item.children) && (item.children.length > 0)) {
      return false;
    }
    return true;
  }
}

const fullSpeciesList = [
  {commonName: 'Pacific hake', taxonomyId: 22500, scientificName: '', visibleName: 'Pacific hake'},
  {commonName: 'Humboldt squid', taxonomyId: 79265, scientificName: '', visibleName: 'Humboldt squid'},
  {commonName: 'Pacific ocean perch', taxonomyId: 30060, scientificName: '', visibleName: 'Pacific ocean perch'},
  {commonName: 'walleye pollock', taxonomyId: 21740, scientificName: '', visibleName: 'walleye pollock'},
  {commonName: 'widow rockfish', taxonomyId: 30220, scientificName: '', visibleName: 'widow rockfish'},
  {commonName: 'yellowtail rockfish', taxonomyId: 30240, scientificName: '', visibleName: 'yellowtail rockfish'},
  {commonName: 'Pacific herring', taxonomyId: 21110, scientificName: '', visibleName: 'Pacific herring'},
  {commonName: 'yellowmouth rockfish', taxonomyId: 30600, scientificName: '', visibleName: 'yellowmouth rockfish'},
  {commonName: 'redstripe rockfish', taxonomyId: 30430, scientificName: '', visibleName: 'redstripe rockfish'},
  {commonName: 'rougheye rockfish', taxonomyId: 30051, scientificName: '', visibleName: 'rougheye rockfish'},
  {commonName: 'jack mackerel', taxonomyId: 20952, scientificName: '', visibleName: 'jack mackerel'},
  {commonName: 'eulachon', taxonomyId: 23010, scientificName: '', visibleName: 'eulachon'},
  {commonName: 'chinook salmon', taxonomyId: 23220, scientificName: '', visibleName: 'chinook salmon'},
  {commonName: 'sharpchin rockfish', taxonomyId: 30560, scientificName: '', visibleName: 'sharpchin rockfish'},
  {commonName: 'Myctophidae', taxonomyId: 22600, scientificName: '', visibleName: 'Myctophidae'},
  {commonName: 'jellyfish unident.', taxonomyId: 40500, scientificName: '', visibleName: 'jellyfish unident.'},
  {commonName: 'silvergray rockfish', taxonomyId: 30100, scientificName: '', visibleName: 'silvergray rockfish'},
  {commonName: 'arrowtooth flounder', taxonomyId: 10110, scientificName: '', visibleName: 'arrowtooth flounder'},
  {commonName: 'Pyrosoma sp.', taxonomyId: 98003, scientificName: '', visibleName: 'Pyrosoma sp.'},
  {commonName: 'splitnose rockfish', taxonomyId: 30190, scientificName: '', visibleName: 'splitnose rockfish'},
  {commonName: 'Euphausiacea', taxonomyId: 63500, scientificName: '', visibleName: 'Euphausiacea'},
  {commonName: 'brown cat shark', taxonomyId: 210, scientificName: '', visibleName: 'brown cat shark'},
];

const fullSpeciesList2 = ['Pacific hake', 'Humboldt squid', 'Pacific ocean perch', 'walleye pollock', 'widow rockfish',
  'yellowtail rockfish', 'Pacific herring', 'yellowmouth rockfish', 'redstripe rockfish', 'rougheye rockfish',
  'jack mackerel', 'eulachon', 'chinook salmon', 'sharpchin rockfish', 'Myctophidae', 'jellyfish unident.',
  'silvergray rockfish', 'arrowtooth flounder', 'Pyrosoma sp.', 'splitnose rockfish', 'Euphausiacea', 'brown cat shark'
];

const mostRecentSpeciesLis2 = ['Pacific hake', 'Humboldt squid', 'Pacific ocean perch', 'walleye pollock', 'widow rockfish',
  'yellowtail rockfish', 'Pacific herring', 'yellowmouth rockfish', 'redstripe rockfish', 'rougheye rockfish',
  'jack mackerel', 'eulachon', 'chinook salmon', 'sharpchin rockfish', 'Myctophidae', 'jellyfish unident.'
];

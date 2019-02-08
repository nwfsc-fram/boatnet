import { Component, OnInit } from '@angular/core';
import { StateService } from '../../_services/data/state.service';

@Component({
  selector: 'app-ots-management',
  templateUrl: './ots-management.component.html',
  styleUrls: ['./ots-management.component.scss']
})
export class OTSManagementComponent implements OnInit {

  previous_covereage_rates = [
    {rate: '22%', start_date: '10/12/2018', end_date: '-'},
    {rate: '27%', start_date: '7/1/2018', end_date: '10/12/2018'},
    {rate: '18%', start_date: '1/1/2018', end_date: '7/1/2018'}
  ]

  ots_coverages = [
    {coverage_type: 'fishery', coverage_target: "Catch Shares - Shore Side Hake", rate: '22%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'fishery', coverage_target: "Limited Entry - Catch Shares", rate: '35%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'fishery', coverage_target: "Trawl Gear - MOD EFP", rate: '45%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'port', coverage_target: "Newport, OR", rate: '35%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'port', coverage_target: "Seattle, WA", rate: '30%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'port', coverage_target: "Astoria, OR", rate: '40%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'port', coverage_target: "Eureka, CA", rate: '28%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "WN2165NM", rate: '35%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "584360", rate: '25%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "219929", rate: '45%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "635397", rate: '100%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "WE4365NM", rate: '77%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "123456", rate: '23%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "GH2313EW", rate: '43%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "CG2343WW", rate: '34%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "K02OWL", rate: '28%', start_date: '10/12/2018', end_date: '10/12/2018' },
    {coverage_type: 'vessel', coverage_target: "WA3265RR", rate: '35%', start_date: '10/12/2018', end_date: '10/12/2018' },
  ]

  data: any;
  chartOptions: any;

  constructor(
    private stateSvc: StateService,
  ) {
    this.data = {
      labels: ['Covered', 'Short'],
      datasets: [
          {
              data: [Math.floor(Math.random() * Math.floor(101)), Math.floor(Math.random() * Math.floor(101))],
              backgroundColor: [
                  "#0093D0",
              ],
              hoverBackgroundColor: [
                  "#FF6384",
              ]
          }]    
      };

    this.chartOptions = {
       legend: {display: false}
      }

  }

  ngOnInit() {
    this.stateSvc.setStateName('ots-management');
  }

}

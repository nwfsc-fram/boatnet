import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';

@Component({
  selector: 'app-trips',
  templateUrl: './trips.component.html',
  styleUrls: ['./trips.component.scss']
})

export class TripsComponent implements OnInit {

  trips = [
    {vessel: 'Excalibur', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '8/03/2018', end_date: '8/20/2018', is_open: false, selected: false, messages: true, id: '123456'}, 
    {vessel: 'Excalibur', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '9/9/2018', end_date: '9/17/2018', is_open: false, selected: true, messages: false, id: '123456'},   
    {vessel: 'Excalibur', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '10/23/2018', end_date: '10/31/2018', is_open: false, selected: false, messages: true, id: '123456'}, 
    {vessel: 'Excalibur', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '11/7/2018', end_date: '11/23/2018', is_open: 'active', selected: true, messages: false, id: '123456'},
    {vessel: 'Excalibur', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '12/1/2018', end_date: '12/15/2018', is_open: 'active', selected: false, messages: true, id: '123456'},
    {vessel: 'Ms Julie', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '9/9/2018', end_date: '9/17/2018', is_open: false, selected: true, messages: false, id: '123456'},   
    {vessel: 'Ms Julie', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '10/23/2018', end_date: '10/31/2018', is_open: false, selected: false, messages: true, id: '123456'}, 
    {vessel: 'Ms Julie', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '11/7/2018', end_date: '11/23/2018', is_open: 'active', selected: true, messages: false, id: '123456'},
    {vessel: 'Last Straw', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '11/7/2018', end_date: '11/23/2018', is_open: 'active', selected: true, messages: false, id: '123456'},
    {vessel: 'Last Straw', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '12/1/2018', end_date: '12/15/2018', is_open: 'active', selected: false, messages: true, id: '123456'},
    {vessel: 'Last Straw', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '12/1/2018', end_date: '12/15/2018', is_open: false, selected: false, messages: true, id: '123456'},
    {vessel: 'Last Straw', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '9/9/2018', end_date: '9/17/2018', is_open: false, selected: true, messages: false, id: '123456'},   
    {vessel: 'Raven', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '10/23/2018', end_date: '10/31/2018', is_open: false, selected: false, messages: true, id: '123456'}, 
    {vessel: 'Raven', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '11/7/2018', end_date: '11/23/2018', is_open: 'active', selected: true, messages: false, id: '123456'},
    {vessel: 'Raven', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '8/03/2018', end_date: '8/20/2018', is_open: false, selected: false, messages: true, id: '123456'}, 
    {vessel: 'Raven', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '9/9/2018', end_date: '9/17/2018', is_open: false, selected: true, messages: false, id: '123456'},   
    {vessel: 'Raven', permits: [
      {id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares'},
      {id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP'},
      {id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake'},
      ],
                                    start_date: '10/23/2018', end_date: '10/31/2018', is_open: false, selected: false, messages: true, id: '123456'}, 
   ]

   vessel = this.stateSvc.currentState.vessel
   permit = this.stateSvc.currentState.permit

  constructor(private stateSvc: StateService,) { }

  ngOnInit() {
    this.stateSvc.setStateName('trips');
  }

  setTrip(trip) {
    this.stateSvc.setTrip(trip)
  }

}

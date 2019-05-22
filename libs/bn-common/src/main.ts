import Vue from 'vue';
import BoatnetDate from './components/BoatnetDate.vue';
import BoatnetDatetime from './components/BoatnetDatetime.vue';
import BoatnetDeleteDialog from './components/BoatnetDeleteDialog.vue';
import BoatnetFishTickets from './components/BoatnetFishTickets.vue';
import BoatnetInputDialog from './components/BoatnetInputDialog.vue';
import BoatnetKeyboard from './components/BoatnetKeyboard.vue';
import BoatnetLicenses from './components/BoatnetLicenses.vue';
import BoatnetSummary from './components/BoatnetSummary.vue';
import BoatnetTable from './components/BoatnetTable.vue';

const Components: any = {
  BoatnetDate,
  BoatnetDatetime,
  BoatnetDeleteDialog,
  BoatnetFishTickets,
  BoatnetInputDialog,
  BoatnetKeyboard,
  BoatnetLicenses,
  BoatnetSummary,
  BoatnetTable,
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export * from './models/BoatnetHaulsSettings';
export * from './models/BoatnetTripsSettings';
export default Components;

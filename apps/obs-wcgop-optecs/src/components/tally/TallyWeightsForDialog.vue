<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Counts/ Weights for {{shortCode}} - {{reason}} </div>
        <div>{{stuffState}}</div>
      </q-card-section>
      <q-btn @click="addTallyCountWeights">ADD</q-btn>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
        <q-btn flat label="Done" @click="addTallyCountWeights" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.component('tally-weights-dialog', {
  props: {
    // For props, this seems complicated, not sure if there's a simpler way
    // https://vuejs.org/v2/guide/components-props.html
    // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
    buttonData: {
      type: Object,
      default: { labels: { shortCode: '', reason: ''}}
    },
    speciesData: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      selectedSpecies: null as any,
      options: [] as any[],
      isOpen: false
    };
  },
  methods: {
    open() {
      this.selectedSpecies = undefined;
      this.isOpen = true;
    },
    close() {
      this.$emit('cancel');
      this.isOpen = false;
    },
    addTallyCountWeights() {
      const dummy = {
        weighedCount: 10,
        weight: 10.25
      };
      this.$store.commit('tallyState/addTallyCountWeight', dummy);
      // this.$emit('addNewSpecies', this.selectedSpecies.doc);
    }

  },
  computed: {
    stuffState(): string {
      return this.$store.getters['tallyState/currentCWData'];
    },
    shortCode(): string {
      return this.buttonData && this.buttonData.labels ? this.buttonData.labels.shortCode : '';
    },
    reason(): string {
      return this.buttonData && this.buttonData.labels ? this.buttonData.labels.reason : '';
    }
  }
});

// @Component
// export default class TallyWeightsForDialog extends Vue {
//   // See usage in obs-wcgop-optecs for example usage
//   @Prop() public speciesList!: any[];
//   private selectedSpecies: any = null;
//   private options: any[] = [];
//   private isOpen = false;

//   public open() {
//     this.selectedSpecies = undefined;
//     this.isOpen = true;
//   }

//   public close() {
//     this.$emit('cancel');
//     this.isOpen = false;
//   }

//   public addTallyCountWeights() {
//       console.log('TODO ADD COUNTS WEIGHTS');
//     //this.$emit('addNewSpecies', this.selectedSpecies.doc);
//   }

//   /**
//    * Autocomplete: Search by 4-letter code and common name
//    */
//   private async filterFn(val: string, update: any, abort: any) {
//     update(async () => {
//       const valUpper = val.toUpperCase();
//       this.options = this.speciesList
//         .filter((s: any) => {
//           return (
//             s.key.startsWith(valUpper) ||
//             s.value.commonName.toUpperCase().indexOf(valUpper) > -1
//           );
//         })
//         .map((s: any) => {
//           return {
//             label: s.key + ': ' + s.value.commonName,
//             ...s
//           };
//         });
//     });
//   }
// }
</script>

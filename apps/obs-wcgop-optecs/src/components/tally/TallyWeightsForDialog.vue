<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Count + Weight Sample</div>
      </q-card-section>

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
    speciesList: {
      type: Array as () => any[]
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
      console.log('TODO ADD COUNTS WEIGHTS');
      // this.$emit('addNewSpecies', this.selectedSpecies.doc);
    },
    async filterFn(val: string, update: any, abort: any) {
      update(async () => {
        const valUpper = val.toUpperCase();
        this.options = this.speciesList
          .filter((s: any) => {
            return (
              s.key.startsWith(valUpper) ||
              s.value.commonName.toUpperCase().indexOf(valUpper) > -1
            );
          })
          .map((s: any) => {
            return {
              label: s.key + ': ' + s.value.commonName,
              ...s
            };
          });
      });
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

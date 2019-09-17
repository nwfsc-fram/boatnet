<template>
  <span>
    <div class="row justify-end">
      <boatnet-keyboard-input
        v-if="showSearch"
        :value.sync="searchText"
        label="Search"
        keyboardType="normal"
        class="q-pb-md"
      >
        <template v-slot:after>
          <q-icon
            v-if="searchText !== ''"
            name="close"
            @click="searchText = ''"
            class="cursor-pointer"
          />
          <q-icon name="search"/>
        </template>
      </boatnet-keyboard-input>
    </div>

    <slot name="table"/>

    <boatnet-delete-dialog
      :message="deleteMessage"
      :show.sync="showDeleteDialog"
      @confirmDelete="onDelete"
    />

    <div class="row q-gutter-sm relative-bottom">
      <q-btn
        :label="currentScreen"
        color="secondary"
        >
        </q-btn>
      <q-btn
        label="Add"
        color="primary"
        icon="add"
        @click="onAdd"
      >
      </q-btn>

      <q-btn
        v-if="showRemove && !hasData"
        label="Remove"
        color="primary"
        icon="remove"
        @click="onRemove"
        :disabled="!current"
      />
      <q-btn
        label="Edit"
        color="primary"
        icon="edit"
        @click="onEdit"
        :disabled="!current"

      />
      <q-btn
        v-if="showEnd"
        label="End"
        color="primary"
        icon="done"
        @click="onEnd"
        :disabled="!current"

      />
      <q-btn
        v-if="showDelete"
        label="Delete"
        color="primary"
        icon="delete_forever"
        @click="showDeleteDialog = true"
        :disabled="!current"

      />
      <q-btn
        v-if="showMove"
        label="Move"
        color="primary"
        icon="fas fa-exchange-alt"
        @click="onMove"
        :disabled="!current"

      />

      <q-space/>
      <slot name="goToButtons"/>
      <span style="position: relative; right: 5px">
        <q-btn v-if="current" color="primary" icon="navigate_next" :label="getNextScreen()" @click="goTo"/>
      </span>
    </div>
  </span>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class BoatnetSummary extends Vue {
  @Prop() public current!: any;
  @Prop() public hasData!: boolean;
  @Prop() public currentScreen!: string;
  @Prop() public selectionId!: number;

  private searchText = '';
  private showSearch = false;
  private showDeleteDialog = false;

  private get showEnd() {
    if (this.currentScreen === 'Trip' || this.currentScreen === 'Haul') {
      return true;
    } else {
      return false;
    }
  }

  private get showRemove() {
    if (this.currentScreen === 'Species') {
      return true;
    } else {
      return false;
    }
  }

  private get showDelete() {
    if (this.currentScreen !== 'Species') {
      return true;
    } else {
      return false;
    }
  }

  private get showMove() {
    if (this.currentScreen === 'Species') {
      return true;
    } else {
      return false;
    }
  }

  private getNextScreen() {
    if (this.currentScreen === 'Trip') {
      return 'Hauls';
    } else if (this.currentScreen === 'Haul') {
      return 'Catch';
    } else if (this.currentScreen === 'Species') {
      return 'Wts & Cnts';
    }
  }

  private get deleteMessage() {
    if (this.current) {
      return (
        'Are you sure you want to delete ' +
        this.currentScreen +
        ' #' +
        this.selectionId +
        '?'
      );
    }
  }

  // Button click emitters
  private onAdd() {
    this.$emit('add');
  }

  private onEdit() {
    this.$emit('edit');
  }

  private onMove() {
    this.$emit('move');
  }

  private onRemove() {
    this.$emit('remove');
  }

  private onEnd() {
    this.$emit('end');
  }

  private onDelete() {
    this.$emit('delete');
  }

  private goTo() {
    this.$emit('goTo');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

@media only screen {
.relative-bottom {
  padding-left: 1%;
  width: 100%;
  position: absolute;
  bottom: 20vh;
  background-color: lightgray !important
  }
}

.q-btn {
  padding: 10px
}
// .q-btn {
//   height: 75px;
// }

</style>
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

    <div class="row q-gutter-sm q-pa-md relative-bottom">
      <q-btn
        color="primary"
        icon="add"
        :label="'Add ' + currentScreen"
        @click="onAdd"

      />
      <q-btn
        v-if="showRemove && !hasData"
        color="primary"
        icon="remove"
        :label="'Remove'"
        @click="onRemove"
        :disabled="!current"

      />
      <q-btn
        color="primary"
        icon="edit"
        :label="'Edit ' + currentScreen"
        @click="onEdit"
        :disabled="!current"

      />
      <q-btn
        v-if="showEnd"
        color="primary"
        icon="done"
        :label="'End ' + currentScreen"
        @click="onEnd"
        :disabled="!current"

      />
      <q-btn
        v-if="showDelete"
        color="primary"
        icon="delete_forever"
        :label="'Delete ' + currentScreen"
        @click="showDeleteDialog = true"
        :disabled="!current"

      />
      <q-btn
        v-if="showMove"
        color="primary"
        icon="fas fa-exchange-alt"
        :label="'Move ' + currentScreen"
        @click="onMove"
        :disabled="!current"

      />

      <q-space/>
      <slot name="goToButtons"/>
      <span style="position: relative; right: 5px">
        <q-btn color="primary" icon="play_arrow" :label="'Go To ' + getNextScreen()" @click="goTo"/>
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
  width: 98%;
  position: absolute;
  bottom: 8vh;
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
<template>
  <div>
    <DataTable
      :value="value"
      :filters="filters"
      :paginator="true"
      :rows="10"
      :selection.sync="selected"
      :resizableColumns="true"
      editMode="cell"
      columnResizeMode="expand"
      @row-select="onRowSelect"
      @row-unselect="onRowUnselect"
      @cell-edit-init="onCellEditInit"
      data-key="key"
    >
      <template #header>
        <div style="text-align:left">
          <MultiSelect
            v-model="columns"
            :options="columnOptions"
            optionLabel="header"
            placeholder="Select Columns"
            style="width: 20em"
          >
            <template #value="slotProps">
              <div>Display Columns</div>
            </template>
          </MultiSelect>
        </div>
      </template>

      <Column selectionMode="multiple" headerStyle="width: 3em"></Column>

      <Column
        v-for="col of columns"
        :field="col.field"
        :header="col.header"
        :key="col.field"
        :sortable="true"
      >
        <template v-if="isEditable" #editor="slotProps">
          <InputText type="text" v-model="cellVal" class="p-column-filter" />
        </template>
        <template #filter>
          <InputText type="text" v-model="filters[col.field]" class="p-column-filter" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { get, set } from 'lodash';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';

Vue.component('DataTable', DataTable);
Vue.component('Column', Column);
Vue.component('InputText', InputText);
Vue.component('MultiSelect', MultiSelect);

@Component
export default class PrimeTable extends Vue {
  @Prop({ default: [] })
  private columns!: any[];
  @Prop({ default: [] })
  private value!: any[];
  @Prop({ default: null })
  private selected!: any[];
  @Prop({ default: false })
  private isEditable!: boolean;
  @Prop()
  private title!: string;

  private filters: any = {};
  private columnOptions = [...this.columns];
  private cellVal: string = '';

  private onCellEditInit(event: any) {
    this.cellVal = get(event.data, event.field);
  }

  private onRowSelect(event: any) {
    this.$emit('onRowSelect', event);
  }

  private onRowUnselect(event: any) {
    this.$emit('onRowUnselect', event);
  }
}
</script>
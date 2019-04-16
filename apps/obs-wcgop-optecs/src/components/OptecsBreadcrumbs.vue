<template>
  <q-btn-group>
    <span v-for="(crumb, i) in breadcrumbs" :key="crumb.name">
      <q-btn
        v-if="i == 0"
        class="btn-arrow-right-only"
        color="white"
        text-color="primary"
        label="Trips"
        icon="home"
        to="/"
      />
      <q-btn
        v-else
        class="btn-arrow-right"
        :color="i != breadcrumbs.length-1 ? 'white' : 'secondary'"
        :text-color="i != breadcrumbs.length-1 ? 'primary' : 'white'"
        :to="crumb.path"
      >{{crumb.value ? crumb.value : crumb.name}}</q-btn>
    </span>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import router from '../router';

@Component
export default class OptecsBreadcrumbs extends Vue {
  // want to store this in state.
  private breadcrumbs = [{ name: 'trips', path: '/', value: 0 }];

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: any) {
    const pageName = this.$router.currentRoute.name;
    const path = this.$router.currentRoute.path;
    let index = this.breadcrumbs.length - 1;

    if (pageName == null) {
      return;
    }

    // if navigating up, remove additional children
    if (this.breadcrumbs.find((crumb) => crumb.name === pageName)) {
      while (
        !this.breadcrumbs[index].name.match(pageName) &&
        this.breadcrumbs[index].name !== 'trips'
      ) {
        this.breadcrumbs.pop();
        index--;
      }
    }

    if (!pageName.match('trips')) {
      this.breadcrumbs.push({
        name: pageName,
        path,
        value: this.getId(path)
      });
    }
  }

  private getId(path: string) {
    const pathContainer = path.split('/');
    return Number(pathContainer[2]);
  }
}
</script>

<template>
  <q-page padding>
    <div class="q-gutter-md">
      <tally-btn color="accent" label="Button" v-for="n in 40" :key="`md-${n}`"/>
    </div>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Tally extends Vue {
  private horizButtonCount = 8;
  private vertButtonCount = 4;
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
.row > div {
  padding: 10px 15px;
  background: rgba(86, 61, 124, 0.15);
  border: 1px solid rgba(86, 61, 124, 0.2);
}

.row + .row {
  margin-top: 1rem;
}
</style>

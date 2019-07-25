<template>
  <div>
      <br>

      <q-btn
        v-for="char of selectedCharSet"
        :label="char"
        color="grey-8"
        :class="numSelected? 'numberbuttons': 'letterbuttons'"
        flat
        :no-caps="!capSelected"
        :key="char"
        @click="onClick(char)"
        ></q-btn>
      <span v-if="numSelected">
      <q-btn label="" no-caps flat ></q-btn>
      <q-btn label="" no-caps flat ></q-btn>
      </span>
      <q-btn label="" color="grey-8" no-caps flat v-if="!numSelected"></q-btn>
      <span v-if="!numSelected && !symSelected">
        <q-btn label="" no-caps flat></q-btn>
        <q-btn label="" no-caps flat></q-btn>
        <q-btn label="" no-caps flat></q-btn>
        <q-btn label="" no-caps flat></q-btn>
      </span>
      <q-btn label="cap" color="grey-8" :flat="!capSelected" @click="capSelected = !capSelected" v-if="!numSelected"></q-btn>
      <q-btn icon="backspace" @click="$emit('bksp')" :class="numSelected ? 'numberbuttons': 'letterbuttons'" color="grey-8" no-caps flat></q-btn>
      <q-btn label="clr" @click="$emit('clear')" color="grey-8" no-caps flat  :class="numSelected? 'numberbuttons': 'letterbuttons'"></q-btn>
      <br>
      <q-btn label="" color="grey-8" no-caps flat></q-btn>
      <q-btn :label="capSelected? 'ABC': 'abc'" color="grey-8" no-caps :flat="numSelected || symSelected" @click="numSelected = false, symSelected = false"></q-btn>
      <q-btn label="num" color="grey-8" :flat="!numSelected" @click="numSelected = !numSelected, symSelected = false"></q-btn>
      <q-btn label="sym" color="grey-8" :flat="!symSelected" @click="symSelected = !symSelected, numSelected = false"></q-btn>
      <br>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BoatnetCustomKeyboard extends Vue {
  // @Prop() public char!: string;

private letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
private numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'];
private symbols = ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '-',
                   '{', '}', '[', ']', '\\', '|', ';', ':', '"', ',', '<', '.', '>', '/', '?', '\''];

private get selectedCharSet() {
  if (this.numSelected) {
    return this.numbers;
  }
  if (this.symSelected) {
    return this.symbols;
  }
  return this.letters;
}

private capSelected: boolean = false;
private numSelected: boolean = false;
private symSelected: boolean = false;

  private onClick(char: string) {
    if (this.capSelected) {
      this.$emit('output', char.toUpperCase());
    } else {
      this.$emit('output', char);
    }
  }

}

</script>

<style scoped>
.q-btn { width: 41px; height: 41px }

.numberbuttons { width: 65px; height: 65px }
.letterbuttons { width: 41px; height: 41px }
</style>

<template>
  <div style="margin: 10px; background-color: white; border: 2px solid grey; border-radius: 5px; padding: 10px">
    <q-input filled v-model="inputValue" style="margin-bottom: 10px">
      <template v-slot:append>
          <q-btn dense round color="grey-7" size="sm" icon="clear" @click="clear"/>
      </template>
      <template v-slot:after>
          <q-btn color="grey-7" icon="backspace" @click="backspace"/>
        </template>
    </q-input>

      <div style="text-align: center">
        <q-btn
          v-for="char of selectedCharSet[0]"
          :label="char"
          color="grey-7"
          :class="numSelected? 'numberbuttons': 'letterbuttons'"
          :no-caps="!capSelected"
          :key="char"
          @click="onClick(char)"
        ></q-btn>
      </div>

      <div style="text-align: center">
        <q-btn
          v-for="char of selectedCharSet[1]"
          :label="char"
          color="grey-7"
          :class="numSelected? 'numberbuttons': 'letterbuttons'"
          :no-caps="!capSelected"
          :key="char"
          @click="onClick(char)"
        ></q-btn>
      </div>

      <div style="text-align: center">
        <q-btn
          v-for="char of selectedCharSet[2]"
          :label="char"
          color="grey-7"
          :class="numSelected? 'numberbuttons': 'letterbuttons'"
          :no-caps="!capSelected"
          :key="char"
          @click="onClick(char)"
        ></q-btn>
        <q-btn v-if="!numSelected && !symSelected" flat></q-btn>
      </div>

      <div style="text-align: center">
        <span v-if="selectedCharSet[3]">
          <q-btn
            v-for="char of selectedCharSet[3]"
            :label="char"
            color="grey-7"
            :class="numSelected? 'numberbuttons': 'letterbuttons'"
            :no-caps="!capSelected"
            :key="char"
            @click="onClick(char)"
          ></q-btn>
        </span>
      </div>

      <div style="display: flex; justify-content: space-between; margin-top: 14px">
        <div>
          <q-btn label="caps" color="grey-7" class="wide-button" :flat="!capSelected" @click="capSelected = !capSelected" v-if="!numSelected && !symSelected"></q-btn>
          <!-- <q-btn icon="backspace" @click="backspace" class="letterbuttons" color="grey-7" no-caps flat></q-btn>
          <q-btn label="clr" @click="clear" color="grey-7" no-caps flat class="letterbuttons"></q-btn> -->
        </div>
        <div v-if="!numSelected && !symSelected">
          <q-btn color="grey-7" no-caps label="space" class="wide-button" @click="onClick(' ')"></q-btn>
        </div>
        <div>
          <q-btn :label="capSelected? 'ABC': 'abc'" color="grey-7" no-caps :flat="numSelected || symSelected" @click="numSelected = false, symSelected = false"></q-btn>
          <q-btn label="sym" color="grey-7" :flat="!symSelected" @click="symSelected = !symSelected, numSelected = false"></q-btn>
          <q-btn label="num" color="grey-7" :flat="!numSelected" @click="numSelected = !numSelected, symSelected = false"></q-btn>
        </div>
      </div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class BoatnetCustomKeyboard extends Vue {
  @Prop() public input!: any;
  @Prop() public attribute!: any;

  private letters = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];
  private numbers = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['0', '.']
    ];
  private symbols = [
      ['~', '!', '@', '#', '$', '%', '^', '&', '*', '/'],
      ['(', ')', '_', '+', '-', '{', '}', '[', ']', '\''],
      ['\\', '|', ';', ':', '"', ',', '<', '.', '>', '?']
    ];

  private get inputValue() {
    return this.input.value;
  }

  private set inputValue(char) {
    this.input.value += char;
  }

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
      this.inputValue = char.toUpperCase();
      // this.inputValue = this.inputValue + char.toUpperCase();
      // this.$emit('output', char.toUpperCase());
      // this.input = text + char.toUpperCase()
    } else {
      this.inputValue = char;
      // this.inputValue = this.inputValue + char;
      // this.input = text + char;
      // this.$emit('output', char);
    }
  }

  private backspace() {
    this.inputValue = this.inputValue.substring(0, this.inputValue.length - 1)
    // this.$emit('bksp');
  }

  private clear() {
    // this.$emit('clear');
    this.inputValue = '';
  }

}

</script>

<style scoped>
.q-btn { width: 45px; height: 45px; margin: 3px }

.numberbuttons { width: 65px; height: 45px }
.letterbuttons { width: 45px; height: 45px; margin: 3px }
.wide-button { width: 90px; height: 45px; margin: 3px}

</style>

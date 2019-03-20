<template>
    <div class="q-pa-md  q-gutter-md">
        <q-card>
            <q-card-section>
            <p><strong>{{ user.name }}</strong></p>
            <q-input filled v-model="user.email" label="Email Address" type="email"></q-input>
            <q-input filled v-model="user.mobile" label="Mobile Number" type="tel"></q-input>
            <q-input filled v-model="user.home" label="Home Number" type="tel"></q-input>
            <hr>
            <q-input filled v-model="user.address" label="Address" type="street-address"></q-input>  
            <q-input filled v-model="user.city" label="City" type="address-level2"></q-input>
            <q-select filled v-model="user.state" label="State" :options="usStates"></q-select>
            <q-input filled v-model="user.zipcode" label="Zip Code" type="postal-code"></q-input>
            <q-select filled v-model="user.homeport" label="Home Port" :options="ports"></q-select>

            </q-card-section>
        </q-card>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';
import router from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

export default class UserDetails extends Vue{

    private get user() {
        return this.$store.getters.activeUser
    }

    private get usStates() {
        return this.$store.state.usStates
    }

    private get ports() {
        return this.$store.state.ports
    }

    constructor() {
        super()
    }

}
</script>

<!--
<script>
export default {
    data() {
        if (this.$route.params.id) {
            return {
                user: this.$store.state.users[this.$route.params.id]
            }
        } else {
            return {
                user: this.$store.getters.activeUser
            }
        }
    },
    computed: {
        usStates() {
            return this.$store.state.usStates
        },
        ports() {
            return this.$store.state.ports
        }
    }
}
</script>
-->

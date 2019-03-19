<template>
    <div class="q-pa-md  q-gutter-md">
        <q-list bordered separator>
            <q-item v-for="(user, i) of users" :key="i" @click="userDetails(i)">
                <q-item-section>
                    <q-item-label>{{ user.name }} ({{ user.role }})</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </div>    
</template>

<script>
export default {
    computed: {
        users() {
            return this.$store.getters.users
        }
    },
    methods: {
        userDetails(i) {
            this.$router.push({path: '/users/' + i})
        }
    }
}
</script>

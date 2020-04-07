<template>
    <div style="">
        <div class="text-h6">{{ label }}</div>

        <label class="cameraButton shadow-2 bg-primary text-white">Add Picture
            <input @change="handleImage($event)" type="file" accept="image/*;capture=camera" capture>
        </label>
        <br>
        <span v-for="file of files" :key="files.indexOf(file)">
            <img :src="getImageUrl(file)" :alt="file.name" style="width: 300px">
            <q-btn style="position: relative; top: -12px; right: 30px" size="sm" icon="clear" round color="primary" @click="removeAtIndex(files.indexOf(file))"></q-btn>
        </span>
        <div>
            <q-btn v-if="files.length > 0" class="submitButton" color="primary">submit images</q-btn>
        </div>

    </div>
</template>

<script lang="ts">
    import { createComponent, ref, reactive, computed } from '@vue/composition-api';
    import Compressor from 'compressorjs';
    import { Emit } from 'vue-property-decorator';

    export default createComponent({
        props: {
            label: String,
            trip: Object
        },
        setup(props, context) {

            const files: any = ref([]);
            const fileUrls: any = ref([]);

            const handleImage = (event: any) => {
                files.value.push(event!.target!.files[0]);
                const newItemIndex = files.value.length - 1;
                fileUrls.value[newItemIndex] = URL.createObjectURL(files.value[newItemIndex]);
            };

            const getImageUrl = (file: any) => {
                return URL.createObjectURL(file);
            };

            const removeAtIndex = (index: number) => {
                files.value.splice(index, 1);
            };

            return {
                handleImage, files, getImageUrl, removeAtIndex
            };
        }
    });
</script>

<style scoped>

    label.cameraButton {
        display: inline-block;
        margin: 10px 0;
        padding: 0.5em;
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
    }

    label.cameraButton input[accept*="camera"] {
        display: none;
    }

    .submitButton {
        border-radius: 4px;
        text-transform: uppercase;
        font-weight: bold;
    }

    label {
        margin: 0
    }

</style>
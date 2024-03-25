<script setup>
import { onMounted, ref, reactive, watchEffect } from 'vue';
import { useIntervalFn } from "@vueuse/core";
import { gas } from "./components/useful.js";

const openedItems = ref(['init']);

const cell = ref();

const sheetState = reactive({});
const isActiveSheetEmpty = ref();

async function doInitSheet() {
    await gas('initActiveSheet');
    isActiveSheetEmpty.value = false;
}

onMounted(() => {
    useIntervalFn(() => {
        gas('pullState').then((result) => Object.assign(sheetState, result));
    }, 1000);

});

watchEffect(async () => {
    console.log('+++ activeSheetName: %o', sheetState.activeSheetName);
    if (sheetState.activeSheetName) {
        isActiveSheetEmpty.value = await gas('isActiveSheetEmpty');
    }
});

</script>

<template>
    <div class="gs-offre-vue">
        <div v-if="isActiveSheetEmpty" class="sheet-init">
            <el-button type="primary" @click="doInitSheet">Init new sheet</el-button>
        </div>
<!--        <el-collapse v-model="openedItems">-->
<!--            <el-collapse-item name="init" title="Initialize">-->
<!--                <div>-->
<!--                    <el-button type="primary">Setup required structure</el-button>-->
<!--                </div>-->
<!--            </el-collapse-item>-->
<!--        </el-collapse>-->
        <div v-else>
            <el-date-picker size="small" type="daterange" :teleported="false"></el-date-picker>
        </div>
    </div>
</template>

<style lang="less">
:root {
    height: -webkit-fill-available;
    * {
        box-sizing: border-box;
    }
}
body, #app {
    height: -webkit-fill-available;
}
</style>

<style>
.gs-offre-vue {
    width: 100%;
    height: -webkit-fill-available;
    display: flex;
    flex-direction: column;
    font-family: sans-serif;

    .sheet-init {
        flex-grow: 1;
        display: grid;
        place-content: center;
    }


    .el-date-editor {
        width: 100% !important;
    }

}
</style>

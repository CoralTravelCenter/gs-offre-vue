<script setup>
import { onMounted, ref, reactive, watchEffect } from 'vue';
import { useIntervalFn } from "@vueuse/core";
import { gas } from "./components/useful.js";
import dayjs from "dayjs";

const openedItems = ref(['common-search']);

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
    }, 2000);

});

watchEffect(async () => {
    console.log('+++ activeSheetName: %o', sheetState.activeSheetName);
    if (sheetState.activeSheetName) {
        isActiveSheetEmpty.value = await gas('isActiveSheetEmpty');
    }
});

function isDisabledDay(dt) {
    return dayjs(dt).isBefore(dayjs());
}

const dt_range = ref();

const chartersOnly = ref(true);
const timeframeType = ref('fluid');
const timeframeMonthly = ref(true);

</script>

<template>
    <div class="gs-offre-vue">
        <div v-if="isActiveSheetEmpty" class="sheet-init">
            <el-button type="primary" @click="doInitSheet">Init new sheet</el-button>
        </div>
        <div v-else>
            <el-collapse v-model="openedItems">
                <el-collapse-item name="common-search" title="Common search params">
                    <el-divider size="small">Flights</el-divider>
                    <el-checkbox v-model="chartersOnly" size="small">Charters only</el-checkbox>
                    <el-divider size="small">Timeframe(s)</el-divider>
                    <el-radio-group class="fullwidth" v-model="timeframeType" size="small" style="width: 100%;">
                        <el-radio-button label="Fixed" value="fixed"></el-radio-button>
                        <el-radio-button label="Fluid" value="fluid"></el-radio-button>
                    </el-radio-group>
                    <el-checkbox v-model="timeframeMonthly" size="small">Group monthly</el-checkbox>
                </el-collapse-item>
            </el-collapse>
            <el-date-picker size="small" type="daterange" v-model="dt_range"
                            :clearable="true"
                            :disabled-date="isDisabledDay"
                            :teleported="false"></el-date-picker>
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

    .el-date-range-picker {
        width: 280px;
        white-space: nowrap;
        .el-picker-panel__body {
            min-width: auto;
            display: grid;
        }
    }
    .el-date-range-picker__content {
        width: 100%;
    }
    .el-date-table td {
        padding: 0;
    }
    .el-date-range-picker__content.is-left {
        border: 0;
        padding-bottom: 0;
    }

    .el-divider__text {
        font-size: 12px;
    }
    .el-divider--horizontal {
        margin: 1em 0;
    }

    .el-radio-group.fullwidth {
        width: 100%;
        >.el-radio-button {
            display: inline-flex;
            flex: 1;
            .el-radio-button__inner {
                flex: 1;
            }
        }
    }

}
</style>

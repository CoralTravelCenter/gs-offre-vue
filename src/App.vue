<script setup>
import { onMounted, ref, reactive, watchEffect, watch } from 'vue';
import { useIntervalFn } from "@vueuse/core";
import { Delete, Plus } from '@element-plus/icons-vue';
import { gas } from "./components/useful.js";
import dayjs from "dayjs";

const openedItems = ref(['common-search']);

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

const chartersOnly = ref(true);
const timeframeType = ref('fluid');
const timeframeMonthly = ref(true);

const commonFluidSince = ref(14);
const commonFluidUntil = ref(14 + 30);
watch(commonFluidSince, (newValue) => {
    if (newValue > commonFluidUntil.value) {
        commonFluidUntil.value = newValue;
    }
});

const isCommonFixedNamed = ref(false);

const commonFixedItems = reactive([{
    name: '',
    timeframe: []
}]);
function moreFixedTimeframe() {
    commonFixedItems.push({name: '', timeframe: []})
}

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
                    <div class="common-fixed" v-if="timeframeType === 'fixed'">
                        <el-checkbox v-model="isCommonFixedNamed" size="small">Named</el-checkbox>
                        <div v-for="(item, idx) in commonFixedItems" class="fixed-item-flex">
                            <div class="name-date-picker">
                                <el-input class="name-input" v-if="isCommonFixedNamed" v-model="item.name" size="small">
                                    <template #prepend>Name</template>
                                </el-input>
                                <el-date-picker size="small" type="daterange" v-model="item.timeframe" class="range-picker"
                                                :clearable="true"
                                                :disabled-date="isDisabledDay"
                                                :teleported="false"></el-date-picker>
                            </div>
                            <el-button v-if="commonFixedItems.length > 1" class="delete-button" size="small" :icon="Delete" @click="commonFixedItems.splice(idx, 1)"></el-button>
                        </div>
                        <el-button class="more-timeframes" :icon="Plus" size="small" @click="moreFixedTimeframe"></el-button>
                    </div>
                    <div class="common-fluid" v-if="timeframeType === 'fluid'">
                        <el-input-number size="small" v-model="commonFluidSince" :min="1" :max="100"></el-input-number>
                        <el-input-number size="small" v-model="commonFluidUntil" :min="commonFluidSince" :max="commonFluidSince + 100"></el-input-number>
                    </div>
                    <el-checkbox v-if="!isCommonFixedNamed" v-model="timeframeMonthly" size="small">Group monthly</el-checkbox>
                </el-collapse-item>
            </el-collapse>
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

    .common-fixed {
        display: flex;
        flex-direction: column;
        gap: .5em;
        padding: 1em 0;
    }

    .fixed-item-flex {
        width: 100%;
        display: flex;
        gap: .5em;
        .name-date-picker {
            display: flex;
            flex-direction: column;
            gap: .5em;
            .name-input {

            }
            .range-picker {

            }
        }
        .delete-button {
            height: unset;
        }
    }

    .more-timeframes {
        align-self: flex-end;
    }

    .common-fluid {
        width: 100%;
        display: flex;
        gap: 1em;
        padding: 1em;
        >* {
            flex: 1;
        }
    }

}
</style>

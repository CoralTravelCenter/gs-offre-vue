<script setup>
import { onMounted, ref, reactive, watchEffect, watch, computed } from 'vue';
import { useEventListener, useIntervalFn } from "@vueuse/core";
import { CircleCheckFilled, WarnTriangleFilled } from '@element-plus/icons-vue';
import { gas } from "./components/useful.js";
import NightsSelector from "./components/NightsSelector.vue";
import TimeframeSelector from "./components/TimeframeSelector.vue";

const openedItems = ref(['common-search']);

const sheetState = reactive({});
const isActiveSheetEmpty = ref();

async function doInitSheet() {
    await gas('initActiveSheet');
    isActiveSheetEmpty.value = false;
}

onMounted(() => {
    // useIntervalFn(() => {
    //     gas('pullState').then((result) => Object.assign(sheetState, result));
    // }, 2000);
});

const pullStateInProgress = ref(false);

useEventListener(document.documentElement, 'mouseenter', async () => {
    console.log('******* MOUSEENTER *************');
    document.documentElement.classList.add('interactive');
    pullStateInProgress.value = true;
    const result = await gas('pullState');
    Object.assign(sheetState, result);
    isActiveSheetEmpty.value = sheetState.isActiveSheetEmpty;
    pullStateInProgress.value = false;
});
useEventListener(document.documentElement, 'mouseleave', () => {
    console.log('========== MOUSELEAVE ==============');
    document.documentElement.classList.remove('interactive');
});

// watchEffect(async () => {
//     console.log('+++ activeSheetName: %o', sheetState.activeSheetName);
//     if (sheetState.activeSheetName) {
//         isActiveSheetEmpty.value = await gas('isActiveSheetEmpty');
//     }
// });

const isTimeframeColumnSelected = computed(() => {
    // return sheetState.selectionHeaders?.includes('timeframe');
    return !!sheetState.timeframeRange;
});
const isNightsColumnSelected = computed(() => {
    return sheetState.selectionHeaders?.includes('nights');
});


const hotelTimeframe = ref(null);

function applyHotelTimeframe() {
    gas('fillRangeWithSameValue', sheetState.timeframeRange, JSON.stringify(hotelTimeframe.value));
}

watch(() => sheetState.timeframeRange, (newRange, oldRange) => {
    if (newRange !== oldRange) {
        console.log('*** sheetState.timeframeRange newRange: %o', newRange);
        if (sheetState.timeframeValues?.length) {
            const timeframe_set = new Set(sheetState.timeframeValues);
            if (timeframe_set.size === 1) {
                hotelTimeframe.value = JSON.parse(sheetState.timeframeValues.at(0) || null);
            } else {
                hotelTimeframe.value = null;
            }
        } else {
            hotelTimeframe.value = null;
        }
    }
});

const hotelNightsSelected = ref([7]);

function applyHotelNights() {
    gas('fillRangeWithSameValue', sheetState.nightsRange, JSON.stringify(hotelNightsSelected.value.sort((a, b) => a - b)));
}

watch(() => sheetState.nightsRange, (newRange, oldRange) => {
    if (newRange !== oldRange) {
        console.log('*** sheetState.nightsRange newRange: %o', newRange);
        if (sheetState.nightsValues?.length) {
            const nights_set = new Set(sheetState.nightsValues);
            if (nights_set.size === 1) {
                let hotel_nights;
                try {
                    hotel_nights = JSON.parse(sheetState.nightsValues.at(0));
                    if (Array.isArray(hotel_nights)) {
                        hotelNightsSelected.value = hotel_nights;
                    } else {
                        hotelNightsSelected.value = [hotel_nights];
                    }
                } catch (ex) {
                    hotel_nights = sheetState.nightsValues.at(0).replace(/[^0-9,]/g, '');
                    if (hotel_nights) {
                        hotelNightsSelected.value = hotel_nights.split(',');
                    } else {
                        hotelNightsSelected.value = [7];
                    }
                }
            } else {
                hotelNightsSelected.value = [7];
            }
        } else {
            hotelNightsSelected.value = [7];
        }
    }
})

const chartersOnly = ref(true);

const commonFluidSince = ref(15);
const commonFluidUntil = ref(15 + 30);
watch(commonFluidSince, (newValue) => {
    if (newValue > commonFluidUntil.value) {
        commonFluidUntil.value = newValue;
    }
});

const commonNightsSelected = ref([7]);

const commonGroupByLocation = ref('areas');
const commonUseAllOffersButton = ref(true);
const commonAllOffersButtonLabel = ref('Все отели');

const commonUsePreferRegion = ref(false);
const commonPreferRegion = ref();
const commonOfferPrice = ref('');


const commonTimeframe = ref(null);
const isCommonTimeframeValid = ref();

const isCommonNightsValid = computed(() => {
    return !!commonNightsSelected.value?.length;
});

const isInterfaceOptionsValid = computed(() => {
    const bad_all_offers_setup = commonUseAllOffersButton.value && !commonAllOffersButtonLabel.value;
    const bad_prefer_region_setup = commonUsePreferRegion.value && !commonPreferRegion.value;
    return !bad_all_offers_setup && !bad_prefer_region_setup;
});

</script>

<template>
    <div class="gs-offre-vue" v-loading="pullStateInProgress">
        <div v-if="isActiveSheetEmpty" class="sheet-init">
            <el-button type="primary" @click="doInitSheet">Init new sheet</el-button>
        </div>
        <div v-else>
            <el-collapse v-model="openedItems">
                <el-collapse-item name="common-search">

                    <template #title>
                        <el-icon size="large" :color="isCommonTimeframeValid && isCommonNightsValid ? 'var(--el-color-success)' : 'var(--el-color-danger)'">
                            <CircleCheckFilled v-if="isCommonTimeframeValid && isCommonNightsValid" />
                            <WarnTriangleFilled v-else />
                        </el-icon>
                        <el-text>Common search params</el-text>
                    </template>

                    <el-divider size="small">Flights</el-divider>
                    <el-checkbox v-model="chartersOnly" size="small">Charters only</el-checkbox>

                    <el-divider size="small">Timeframe(s)</el-divider>
                    <TimeframeSelector auto-apply v-model="commonTimeframe"
                                       @is-valid="isValid => isCommonTimeframeValid = isValid"></TimeframeSelector>

                    <el-divider size="small">Stay nights</el-divider>
                    <NightsSelector v-model="commonNightsSelected" auto-apply />
                </el-collapse-item>

                <el-collapse-item name="interface-options">
                    <template #title>
                        <el-icon size="large" :color="isInterfaceOptionsValid ? 'var(--el-color-success)' : 'var(--el-color-danger)'">
                            <CircleCheckFilled v-if="isInterfaceOptionsValid" />
                            <WarnTriangleFilled v-else />
                        </el-icon>
                        <el-text>Interface options</el-text>
                    </template>
                    <div class="fields-stack">
                        <el-input class="location-grouping-combo" type="text" size="small">
                            <template #prepend>Group by location</template>
                            <template #append>
                                <el-select v-model="commonGroupByLocation" size="small">
                                    <el-option label="Country" value="countries"></el-option>
                                    <el-option label="Region" value="regions"></el-option>
                                    <el-option label="Area" value="areas"></el-option>
                                    <el-option label="Place" value="places"></el-option>
                                </el-select>
                            </template>
                        </el-input>
                        <el-input size="small" v-model="commonAllOffersButtonLabel" :disabled="!commonUseAllOffersButton">
                            <template #prepend>
                                <el-checkbox v-model="commonUseAllOffersButton" size="small">"All offers" button</el-checkbox>
                            </template>
                        </el-input>
                        <el-input size="small" v-model="commonPreferRegion" :disabled="!commonUsePreferRegion">
                            <template #prepend>
                                <el-checkbox v-model="commonUsePreferRegion" size="small">Prefer region</el-checkbox>
                            </template>
                        </el-input>
                        <el-input class="location-grouping-combo" type="text" size="small">
                            <template #prepend>Display offer price</template>
                            <template #append>
                                <el-select v-model="commonOfferPrice" size="small">
                                    <el-option label="as is" value=""></el-option>
                                    <el-option label="per night" value="per-night"></el-option>
                                    <el-option label="per person" value="per-person"></el-option>
                                </el-select>
                            </template>
                        </el-input>
                    </div>
                </el-collapse-item>

                <el-collapse-item v-if="isTimeframeColumnSelected || isNightsColumnSelected" name="hotel-search" title="Hotel(s) search params">
                    <el-divider v-if="isTimeframeColumnSelected" size="small">Timeframe(s)</el-divider>
                    <TimeframeSelector v-if="isTimeframeColumnSelected" v-model="hotelTimeframe" @apply="applyHotelTimeframe"></TimeframeSelector>

                    <el-divider v-if="isNightsColumnSelected" size="small">Stay nights</el-divider>
                    <NightsSelector v-if="isNightsColumnSelected" v-model="hotelNightsSelected" @apply="applyHotelNights" />

                </el-collapse-item>

            </el-collapse>
        </div>
    </div>
</template>

<style lang="less">
:root {
    height: -webkit-fill-available;
    -webkit-font-smoothing: antialiased;
    * {
        box-sizing: border-box;
    }

    transition: filter .4s, opacity .4s;

    &:not(.interactive) {
        pointer-events: none;
        opacity: .5;
        filter: blur(2px) saturate(0);
    }

}
body, #app {
    height: -webkit-fill-available;
    font-family: sans-serif;
}
</style>

<style>
.gs-offre-vue {
    width: 100%;
    height: -webkit-fill-available;
    display: flex;
    flex-direction: column;

    .sheet-init {
        flex-grow: 1;
        display: grid;
        place-content: center;
    }

    .el-collapse-item__header {
        .el-icon {
            margin-right: .3em;
        }
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

        > .el-radio-button {
            display: inline-flex;
            flex: 1;

            .el-radio-button__inner {
                flex: 1;
            }
        }
    }

    .el-input-group__prepend {
        padding: 0 .7em;
    }

    .fields-stack {
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

        > * {
            flex: 1;
        }
    }

    .location-grouping-combo {
        .el-input__wrapper {
            display: none;
        }

        .el-input-group__append {
            background-color: unset;
            flex: 1;
            padding: 0;
        }
    }

}
</style>

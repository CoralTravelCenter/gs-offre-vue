<script setup>
import { Delete, Plus } from "@element-plus/icons-vue";
import { reactive, ref, watch, computed, watchEffect } from "vue";
import dayjs from "dayjs";

const props = defineProps({
    modelValue: Object,
    autoApply: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:modelValue','apply','isValid']);

const timeframeType = ref();
const isFixedNamed = ref();
const fixedItems = reactive([{ name: '', timeframe: [] }]);
function moreFixedTimeframe() {
    fixedItems.push({ name: '', timeframe: [] });
}

const fluidSince = ref();
const fluidUntil = ref();
watch(fluidSince, (newValue) => {
    if (newValue > fluidUntil.value) fluidUntil.value = newValue;
});

const timeframeMonthly = ref();

watchEffect(() => {
    timeframeType.value = props.modelValue?.timeframeType ?? 'fluid';
    isFixedNamed.value = props.modelValue?.isFixedNamed ?? false;
    fixedItems.splice(0, Infinity, ...(props.modelValue?.fixedItems ?? [{ name: '', timeframe: [] }]));
    fluidSince.value = props.modelValue?.fluidSince ?? 15;
    fluidUntil.value = props.modelValue?.fluidUntil ?? (15 + 30);
    timeframeMonthly.value = props.modelValue?.timeframeMonthly ?? true;
});

watchEffect(() => {
    isFixedNamed.value = fixedItems.length > 1;
}, { flush: 'post' });

function isDisabledDay(dt) {
    return dayjs(dt).isBefore(dayjs());
}

const isTimeframeSetupValid = computed(() => {
    if (timeframeType.value === 'fixed') {
        if (fixedItems.length === 1) {
            const item = fixedItems[0];
            return (isFixedNamed.value ? !!item.name : true) && !!item.timeframe[0] && !!item.timeframe[1];
        } else {
            const ranges_and_names_defined = fixedItems.every((item) => {
                const date_range_defined = item.timeframe?.length === 2 && !!item.timeframe[0] && !!item.timeframe[1];
                return (isFixedNamed.value ? !!item.name : true) && date_range_defined;
            });
            const all_names_different = new Set(fixedItems.map(i => i.name)).size === fixedItems.length;
            return ranges_and_names_defined && all_names_different;
        }
    } else if (timeframeType.value === 'fluid') {
        return fluidSince.value >= 1 && fluidUntil.value >= fluidSince.value;
    }
});

watchEffect(() => {
    emit('isValid', isTimeframeSetupValid.value);
});

const timeframeDescriptor = computed(() => {
    const descriptor = {
        timeframeType: timeframeType.value,
        timeframeMonthly: timeframeMonthly.value,
    };
    if (timeframeType.value === 'fixed') {
        Object.assign(descriptor, { isFixedNamed: isFixedNamed.value, fixedItems });
    } else if (timeframeType.value === 'fluid') {
        Object.assign(descriptor, { fluidSince: fluidSince.value, fluidUntil: fluidUntil.value });
    }
    return descriptor;
});

function updateModelValue() {
    emit('update:modelValue', timeframeDescriptor.value);
}

function apply() {
    updateModelValue();
    emit('apply');
}

watchEffect(() => {
    if (isTimeframeSetupValid.value && props.autoApply) {
        updateModelValue();
    }
});

</script>

<template>
    <div class="timeframe-selector">
        <el-radio-group class="fullwidth" v-model="timeframeType" size="small" style="width: 100%;">
            <el-radio-button label="Fluid" value="fluid"></el-radio-button>
            <el-radio-button label="Fixed" value="fixed"></el-radio-button>
        </el-radio-group>
        <div class="fields-stack" v-if="timeframeType === 'fixed'">
            <el-checkbox v-model="isFixedNamed" :disabled="fixedItems.length > 1" size="small">Named</el-checkbox>
            <div v-for="(item, idx) in fixedItems" class="fixed-item-flex">
                <div class="name-date-picker">
                    <el-input class="name-input" v-if="isFixedNamed" v-model="item.name" size="small">
                        <template #prepend>Name</template>
                    </el-input>
                    <el-date-picker size="small" type="daterange" v-model="item.timeframe"
                                    class="range-picker"
                                    :clearable="true"
                                    :disabled-date="isDisabledDay"
                                    :teleported="false"></el-date-picker>
                </div>
                <el-button v-if="fixedItems.length > 1" class="delete-button" size="small"
                           :icon="Delete" @click="fixedItems.splice(idx, 1)"></el-button>
            </div>
            <el-button class="more-timeframes" :icon="Plus" size="small"
                       @click="moreFixedTimeframe"></el-button>
        </div>
        <div class="common-fluid" v-if="timeframeType === 'fluid'">
            <el-input-number size="small" v-model="fluidSince" :min="1" :max="100"></el-input-number>
            <el-input-number size="small" v-model="fluidUntil" :min="fluidSince" :max="fluidSince + 100"></el-input-number>
        </div>
        <el-checkbox v-if="!isFixedNamed" v-model="timeframeMonthly" size="small">Split by month</el-checkbox>
        <div v-if="!autoApply" class="should-apply">
            <el-button type="success" size="small" :disabled="!isTimeframeSetupValid" @click="apply">Apply timeframe(s)</el-button>
        </div>
    </div>
</template>

<style scoped lang="less">
    .should-apply {
        margin-top: .5em;
    }
</style>
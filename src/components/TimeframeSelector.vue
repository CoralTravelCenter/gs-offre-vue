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
const emit = defineEmits(['update:modelValue']);

const timeframeType = ref(props.modelValue?.timeframeType ?? 'fluid');
const isFixedNamed = ref(props.modelValue?.isFixedNamed ?? false);
const fixedItems = reactive(props.modelValue?.fixedItems ?? [{ name: '', timeframe: [] }]);
function moreFixedTimeframe() {
    fixedItems.push({name: '', timeframe: []})
}

const fluidSince = ref(props.modelValue?.fluidSince ?? 15);
const fluidUntil = ref(props.modelValue?.fluidUntil ?? (15 + 30));
watch(fluidSince, (newValue) => {
    if (newValue > fluidUntil.value) fluidUntil.value = newValue;
});

const timeframeMonthly = ref(props.modelValue?.timeframeMonthly ?? true);

function isDisabledDay(dt) {
    return dayjs(dt).isBefore(dayjs());
}

const isTimeframeSetupValid = computed(() => {
    if (timeframeType.value === 'fixed') {
        return fixedItems.every((item) => {
            const date_range_defined = item.timeframe?.length === 2 && !!item.timeframe[0] && !!item.timeframe[1];
            return (isFixedNamed.value ? !!item.name : true) && date_range_defined;
        });
    } else if (timeframeType.value === 'fluid') {
        return fluidSince.value >= 1 && fluidUntil.value >= fluidSince.value;
    }
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
    // emit('update:modelValue', {
    //     timeframeType: timeframeType.value,
    //     isFixedNamed: isFixedNamed.value,
    //     fixedItems,
    //     timeframeMonthly: timeframeMonthly.value,
    //     fluidSince: fluidSince.value,
    //     fluidUntil: fluidUntil.value
    // });
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
            <el-radio-button label="Fixed" value="fixed"></el-radio-button>
            <el-radio-button label="Fluid" value="fluid"></el-radio-button>
        </el-radio-group>
        <div class="fields-stack" v-if="timeframeType === 'fixed'">
            <el-checkbox v-model="isFixedNamed" size="small">Named</el-checkbox>
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
        <el-checkbox v-if="!isFixedNamed" v-model="timeframeMonthly" size="small">Group monthly</el-checkbox>
        <div v-if="!autoApply" class="should-apply">
            <el-button type="success" size="small" :disabled="!isTimeframeSetupValid" @click="updateModelValue">Apply timeframe(s)</el-button>
        </div>
    </div>
</template>

<style scoped lang="less">
    .should-apply {
        margin-top: .5em;
    }
</style>
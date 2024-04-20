<script setup>
import { computed, reactive, watchEffect, watch } from "vue";

const props = defineProps({
    modelValue:      Array,
    searchType: {
        type:    String,
        default: 'package'
    },
    autoApply: {
        type: Boolean,
        default: false
    }
});
const emit = defineEmits(['shouldValidate', 'update:modelValue', 'apply']);

const selectionSet = reactive(new Set());

const nightsOptions = reactive(Array.from((function* () {
    for (let idx = 1; idx <= 28; idx++) {
        let night = { value: idx };
        if (props.modelValue.length && props.modelValue.includes(idx)) selectionSet.add(night);
        yield night;
    }
}())));

watch(() => props.modelValue, (newValues) => {
    selectionSet.clear();
    nightsOptions.filter(night => newValues.includes(night.value)).forEach(night => selectionSet.add(night));
});

function handleNightClick(night) {
    if (selectionSet.has(night)) {
        selectionSet.delete(night);
    } else {
        selectionSet.add(night);
        if (selectionSet.size > (props.searchType === 'package' ? 8 : 1)) {
            selectionSet.delete([...selectionSet][0]);
        }
    }
    props.autoApply && updateModelValue();
}

function updateModelValue() {
    emit('update:modelValue', [...selectionSet].map(n => n.value));
}

// watchEffect(() => {
//     if (props.autoApply) {
//         emit('update:modelValue', [...selectionSet].map(n => n.value));
//     }
// });

function apply() {
    updateModelValue();
    emit('apply');
}

const selectionReadout = computed(() => {
    const nightsOrdered = Array.from(selectionSet).map(night => night.value).sort((a, b) => a - b);
    let token;
    const tokenList = [];
    nightsOrdered.forEach((n, idx, list) => {
        if (idx === 0) {
            token = [n];
            tokenList.push(token);
        } else {
            if (n === token.at(-1) + 1) {
                token.push(n);
            } else {
                token = [n];
                tokenList.push(token);
            }
        }
    });
    if (tokenList.length) {
        return tokenList.map(token => {
            if (token.length === 1) return token[0]
            else {
                return `${ token.at(0) } - ${ token.at(-1) }`;
            }
        }).join(', ');
    } else {
        return 'Choose...'
    }
});

</script>

<template>
    <div class="nights-selector">
        <el-popover trigger="click" placement="bottom-start" width="auto" :teleported="false" @hide="$emit('shouldValidate')">
            <template #reference>
                <div class="input-readout">{{ selectionReadout }}</div>
            </template>
            <div class="nights-grid">
                <button v-for="night in nightsOptions"
                        :class="{
                        selected: selectionSet.has(night),
                        disabled: night.disabled
                    }"
                        @click="handleNightClick(night)">{{ night.value }}</button>
            </div>
        </el-popover>
        <div v-if="!autoApply" class="should-apply">
            <el-button type="success" size="small" :disabled="!selectionSet.size" @click="apply">Apply nights</el-button>
        </div>
    </div>
</template>

<style scoped lang="less">
.input-readout {
    width: 100%;
    line-height: 2.4;
    border-radius: 4px;
    padding: 0 1em;
    box-shadow: inset 0 0 0 1px var(--el-color-info-light-7);
    cursor: pointer;
    &:hover {
        box-shadow: inset 0 0 0 1px var(--el-color-primary);
    }
}
.nights-grid {
    display: grid;
    grid-template-columns: repeat(7,auto);
    gap: .5em;
    button {
        outline: none;
        line-height: 1;
        width: 2.2em;
        height: 2.2em;
        display: inline-grid;
        place-content: center;
        cursor: pointer;
        border: 0;
        border-radius: 3px;
        background-color: var(--el-color-primary-light-9);
        &.disabled {
            pointer-events: none;
            opacity: .15;
        }

        &.selected {
            background-color: var(--el-color-primary);
            color: white;
        }
    }
}

.should-apply {
    margin-top: .5em;
}

</style>
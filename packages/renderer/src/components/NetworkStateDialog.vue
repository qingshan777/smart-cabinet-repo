<template>
  <BaseDialog v-model:visible="show" title="网络状态">
    <div class="state-bar pt-[20px]">
      <div class="label">当前状态：</div>
      <div class="content">{{ networkIsOnline ? '连接成功' : '连接失败' }}</div>
    </div>

    <div class="state-bar">
      <div class="label">解决方案：</div>
      <div class="content">{{ networkIsOnline ? '网络正常连接' : '请检查数据库链接配置是否正常，并重新启动软件。' }}</div>
    </div>
  </BaseDialog>
</template>

<script lang="ts" setup>
import BaseDialog from './BaseDialog.vue'
import { useStore } from '@/store'

interface Props {
  visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
  visible: false
})
const emits = defineEmits(['update:visible'])
const store = useStore()
const { networkIsOnline } = storeToRefs(store)

const show = computed({
  get: () => {
    return props.visible
  },
  set: value => {
    emits('update:visible', value)
  }
})
</script>

<style scoped>
.state-bar {
  @apply mb-[16px] flex text-sm;
}
.state-bar .label {
  @apply w-[70px];
}

.state-bar .content {
  @apply flex-1;
}
</style>

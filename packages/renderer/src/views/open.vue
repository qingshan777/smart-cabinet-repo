<template>
  <div class="bg-primary-color relative mx-1 flex h-full flex-col">
    <div class="blue-gradient flex h-[50px] items-center justify-end">
      <span class="mr-[20px] cursor-pointer select-none text-lg text-white underline" @click="goBack">返回</span>
    </div>

    <div class="">
      <div class="flex h-[80px] flex-col items-center justify-center text-2xl text-white">
        <h3 v-if="lockControlIsOnline" class="text-white">柜门已打开</h3>
        <h3 v-else class="text-red-500">锁控板连接异常</h3>
      </div>

      <div class="mb-4 border-b-2 border-white"></div>

      <div class="px-4">
        <DocumentTable
          :data="data"
          :total="total"
          :condition="{ page: condition.page, size: condition.size }"
          @on-page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from '@/store'
import { useCheckStore } from '@/store/check'
import useTime from '@/hooks/useTime'
import useViewDocuments from '@/hooks/useViewDocuments'

interface Props {
  id: number
}

const props = defineProps<Props>()

const router = useRouter()
const store = useStore()
const { lockControlIsOnline } = storeToRefs(store)
const checkStore = useCheckStore()
const {} = storeToRefs(checkStore)
const { DocumentTable, getDocuments, data, total } = useViewDocuments()
const { resetOperationTimeoutCountdown } = useTime()

const goBack = () => {
  resetOperationTimeoutCountdown()

  router.go(-1)
}

const condition = reactive<DocumentQueryProps>({
  page: 1,
  size: 5,
  title: '',
  cabinetId: props.id,
  departmentId: null,
  state: null
})

const handlePageChange = async (page: number) => {
  condition.page = page

  getDocuments(condition)
}

onMounted(() => {
  getDocuments(condition)
})
</script>

<style scoped>
.statistics div {
  @apply my-4 px-2 text-lg text-white;
}

.result-record h3 {
  @apply text-white;
}
</style>

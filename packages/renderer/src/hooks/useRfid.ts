import { useStore } from '@/store'
import createAlert from '@/components/BaseAlert'
import { CHECK_TIME } from '@/config'
import useDocument from './useDocument'
import useCabinet from './useCabinet'

export default function () {
  const store = useStore()
  const { changeRfidIsConnected, saveCabinetDoorList, changeCabinetDoorData } = store
  const { cabinetDoorList, misPlaceDocumentCount, isChecking } = storeToRefs(store)
  const { updateDocumentStatus, getAllDocumentData, getMisPlaceDocuments, generateCheckResult } = useDocument()
  const { getCabinetDoorInfo } = useCabinet()

  // 获取 RFID 连接状态
  const getRfidConnectState = async () => {
    await initRfid()
    await destroyRfid()
  }

  const initRfid = async () => {
    const { TXADDR, TXADDRPORT } = cabinetDoorList.value[0]
    if (TXADDR === null) return
    const isConnected = await window.JSBridge.rfid.init(TXADDR, TXADDRPORT)
    changeRfidIsConnected(isConnected)
    return isConnected
  }

  const sendOpenCommand = async (antennaIds: string | null) => {
    if (!antennaIds) return

    const antennaIdList = antennaIds.split(',').map(item => Number(item))
    return await window.JSBridge.rfid.sendOpenCommand(antennaIdList)
  }

  const sendCloseCommand = async () => {
    return await window.JSBridge.rfid.sendCloseCommand()
  }

  const destroyRfid = async () => {
    return await window.JSBridge.rfid.destroy()
  }

  /**
   * @description: 开启盘点
   * @return {*}
   */
  // const startCheck = async () => {
  //   const isConnected = await initRfid()

  //   if (!isConnected) {
  //     createAlert('读取连接设备失败')
  //     return
  //   }

  //   if (isChecking.value) {
  //     createAlert('正在盘点中')
  //     return
  //   }

  //   await sendCloseCommand()
  //   await sendOpenCommand()

  //   changeIsChecking(true)
  //   const beforeDocuments = await getAllDocumentData()
  //   const beforeMisPlaceDocumentCount = misPlaceDocumentCount.value
  //   console.log('🚀 ~ file: useRfid.ts:62 ~ startCheck ~ beforeMisPlaceDocumentCount', beforeMisPlaceDocumentCount)

  //   let timer = window.setInterval(async () => {
  //     changeCheckTime(checkTime.value - 1)

  //     if (checkTime.value === 0) {
  //       clearInterval(timer)
  //       // 发送关闭命令
  //       await sendCloseCommand()
  //       // 更新文件状态
  //       await updateDocumentStatus()
  //       // 销毁 socket 实例
  //       await destroyRfid()

  //       // 获取更新后的文件以及错位文件数量，生成盘点结果
  //       const afterDocuments = await getAllDocumentData()
  //       await getMisPlaceDocuments()
  //       const afterMisPlaceDocumentCount = misPlaceDocumentCount.value
  //       console.log('🚀 ~ file: useRfid.ts:80 ~ timer ~ afterMisPlaceDocumentCount', afterMisPlaceDocumentCount)
  //       generateCheckResult({ beforeDocuments, afterDocuments, beforeMisPlaceDocumentCount, afterMisPlaceDocumentCount })

  //       changeIsChecking(false)
  //       nextTick(() => {
  //         changeCheckTime(CHECK_TIME)
  //       })
  //     }
  //   }, 1000)
  // }

  /**
   * @description: 开启盘点
   * @return {*}
   */
  const startInventory = async (doorId: number) => {
    const door = computed(() => {
      return cabinetDoorList.value.find(item => item.ID === doorId)
    })

    if (door.value === undefined) return

    const isConnected = await initRfid()
    if (!isConnected) {
      createAlert('读取连接设备失败')
      return false
    }

    const isInventory = door.value.checkCountDown !== 10
    if (isInventory) {
      createAlert('该柜门正在盘点中')
      return false
    }

    await sendCloseCommand()
    console.log("🚀 ~ file: useRfid.ts:120 ~ startInventory ~ door.value.TXID", door.value.TXID)
    await sendOpenCommand(door.value.TXID)

    // const beforeDocuments = await getAllDocumentData()
    // const beforeMisPlaceDocumentCount = misPlaceDocumentCount.value

    let timer = window.setInterval(async () => {
      if (door.value === undefined) return

      changeCabinetDoorData({ ...door.value, checkCountDown: door.value.checkCountDown - 1 })
      console.log("🚀 ~ file: useRfid.ts:128 ~ timer ~ door.value.checkCountDown", door.value.checkCountDown)

      if (door.value.checkCountDown === 0) {
        console.log('盘点计时结束')

        clearInterval(timer)

        // 发送关闭命令
        await sendCloseCommand()
        // 更新文件状态
        await updateDocumentStatus(door.value)
        // 重新获取柜门文件信息
        getCabinetDoorInfo()

        // 获取更新后的文件以及错位文件数量，生成盘点结果
        // const afterDocuments = await getAllDocumentData()
        // await getMisPlaceDocuments()
        // const afterMisPlaceDocumentCount = misPlaceDocumentCount.value
        // generateCheckResult({ beforeDocuments, afterDocuments, beforeMisPlaceDocumentCount, afterMisPlaceDocumentCount })

        nextTick(async () => {
          if (door.value === undefined) return
          // 复原倒计时
          changeCabinetDoorData({ ...door.value, checkCountDown: CHECK_TIME })

          // 如果没有正在盘点的柜门，则销毁 socket 实例
          if (!isChecking.value) await destroyRfid()
        })
      }
    }, 1000)
  }

  return {
    getRfidConnectState,
    // startCheck
    startInventory
  }
}
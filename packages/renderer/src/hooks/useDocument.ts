import { useStore } from '@/store'
import { useCheckStore } from '@/store/check'

export default function () {
  const store = useStore()
  const { saveMisPlaceDocumentData, saveDocumentList } = store
  const { user, documentList, misPlaceDocumentData } = storeToRefs(store)
  const checkStore = useCheckStore()
  const {
    setFirstDocumentRecord,
    setFirstMisPlaceDocumentRecord,
    setEndDocumentRecord,
    setEndMisPlaceDocumentRecord
  } = checkStore

  const getAllDocumentData = async () => {
    const documents = await window.JSBridge.document.getAllDocumentData()
    saveDocumentList(documents)
    return documents
  }

  const getDocumentData = async (condition: DocumentQueryProps) => {
    return await window.JSBridge.document.getDocumentData({ ...condition })
  }

  /**
   * @description: 根据柜门 ID 获取载体数据
   * @param {number} cabinetId 柜门 ID
   * @return {*}
   */
  const getDocumentByCabinetId = async (cabinetId: number) => {
    return await window.JSBridge.document.getDocumentByCabinetId(cabinetId)
  }

  /**
   * @description: 获取在位载体数量
   * @param {number} cabinetId 柜门 ID
   * @return {*}
   */
  const getInPlaceDocumentCount = async (cabinetId?: number) => {
    return await window.JSBridge.document.getInPlaceDocumentCount(cabinetId)
  }

  /**
   * @description: 获取错放载体数据
   * @return {*}
   */
  const getMisPlaceDocuments = async () => {
    const records = await window.JSBridge.document.getMisPlaceDocuments()
    saveMisPlaceDocumentData(records)
    return records
  }

  /**
   * @description: 根据 RFID 读取器读取到的数据更新载体状态
   * @return {*}
   */
  const updateDocumentStatus = async (door: CabinetDoorProps) => {
    const id = user.value?.id
    await window.JSBridge.document.updateDocumentStateAfterCheck({ ...door }, id)
  }

  /**
   * @description: 记录开始盘点时的载体数据
   * @return {*}
   */
  const recordDataWhenCheckStart = async () => {
    setFirstDocumentRecord(documentList.value)
    setFirstMisPlaceDocumentRecord(misPlaceDocumentData.value)
  }

  /**
   * @description: 记录结束盘点时的载体数据
   * @return {*}
   */
  const recordDataWhenCheckEnd = async () => {
    const documents = await getAllDocumentData()
    const misPlaceDocuments = await getMisPlaceDocuments()
    setEndDocumentRecord(documents)
    setEndMisPlaceDocumentRecord(misPlaceDocuments)
  }

  return {
    getDocumentData,
    getAllDocumentData,
    getMisPlaceDocuments,
    updateDocumentStatus,
    getDocumentByCabinetId,
    getInPlaceDocumentCount,
    recordDataWhenCheckStart,
    recordDataWhenCheckEnd
  }
}

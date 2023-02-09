import { SerialPort as SerialPortLib } from 'serialport'

export default class SerialPort {
  private portInstance: null | SerialPortLib = null
  private data: string = ''

  constructor({ path, baudRate = 9600 }: { path: string; baudRate?: number }) {
    this.init({ path, baudRate })
    this.addDataListener()
  }

  private init({ path, baudRate = 9600 }: { path: string; baudRate?: number }) {
    if (this.portInstance) return
    this.portInstance = new SerialPortLib({ path, baudRate }, err => {
      if (err) {
        console.log(`串口打开失败,${err}`)
      }
    })
  }

  // 查询串口列表
  queryPortList() {
    return SerialPortLib.list()
  }

  // 写入数据
  write(data) {
    if (!this.portInstance) return
    this.portInstance.write(data)
  }

  getData() {
    if (!this.portInstance) return
    return this.data
  }

  setData(source: string) {
    this.data = source
  }

  // 添加数据返回的监听器
  addDataListener() {
    if (!this.portInstance) return

    this.portInstance.on('data', data => {
      this.data += data.toString('hex')
    })
  }

  // 关闭串口
  close() {
    if (!this.portInstance) return
    this.portInstance.close()
    this.portInstance = null
    this.data = ''
  }
}
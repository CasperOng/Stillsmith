// A small store-only ZIP writer. Frames are already compressed, so the extra
// pass a compressor would cost is not worth it, and this keeps the page free
// of dependencies.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

const crc32 = (bytes) => {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i += 1) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

const dosTime = (date) => {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2)
  const year = Math.max(1980, date.getFullYear())
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, date: day }
}

/**
 * @param {{ name: string, data: Uint8Array }[]} files
 * @returns {Blob}
 */
export function makeZip(files) {
  const encoder = new TextEncoder()
  const stamp = dosTime(new Date())
  const local = []
  const central = []
  let offset = 0

  for (const file of files) {
    const name = encoder.encode(file.name)
    const data = file.data
    const crc = crc32(data)

    const header = new Uint8Array(30 + name.length)
    const h = new DataView(header.buffer)
    h.setUint32(0, 0x04034b50, true)
    h.setUint16(4, 20, true)
    h.setUint16(6, 0x0800, true)
    h.setUint16(8, 0, true)
    h.setUint16(10, stamp.time, true)
    h.setUint16(12, stamp.date, true)
    h.setUint32(14, crc, true)
    h.setUint32(18, data.length, true)
    h.setUint32(22, data.length, true)
    h.setUint16(26, name.length, true)
    h.setUint16(28, 0, true)
    header.set(name, 30)

    const entry = new Uint8Array(46 + name.length)
    const e = new DataView(entry.buffer)
    e.setUint32(0, 0x02014b50, true)
    e.setUint16(4, 20, true)
    e.setUint16(6, 20, true)
    e.setUint16(8, 0x0800, true)
    e.setUint16(10, 0, true)
    e.setUint16(12, stamp.time, true)
    e.setUint16(14, stamp.date, true)
    e.setUint32(16, crc, true)
    e.setUint32(20, data.length, true)
    e.setUint32(24, data.length, true)
    e.setUint16(28, name.length, true)
    e.setUint16(30, 0, true)
    e.setUint16(32, 0, true)
    e.setUint16(34, 0, true)
    e.setUint16(36, 0, true)
    e.setUint32(38, 0, true)
    e.setUint32(42, offset, true)
    entry.set(name, 46)

    local.push(header, data)
    central.push(entry)
    offset += header.length + data.length
  }

  const centralSize = central.reduce((sum, entry) => sum + entry.length, 0)
  const end = new Uint8Array(22)
  const e = new DataView(end.buffer)
  e.setUint32(0, 0x06054b50, true)
  e.setUint16(4, 0, true)
  e.setUint16(6, 0, true)
  e.setUint16(8, files.length, true)
  e.setUint16(10, files.length, true)
  e.setUint32(12, centralSize, true)
  e.setUint32(16, offset, true)
  e.setUint16(20, 0, true)

  return new Blob([...local, ...central, end], { type: 'application/zip' })
}

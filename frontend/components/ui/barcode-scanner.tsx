'use client'
import { useEffect, useRef } from 'react'

interface Props {
  onScan: (code: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<any>(null)

  useEffect(() => {
    let mounted = true
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (!mounted || !ref.current) return
      const scanner = new Html5Qrcode('barcode-reader')
      scannerRef.current = scanner
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText: string) => {
          onScan(decodedText)
          scanner.stop().catch(() => {})
          onClose()
        },
        () => {}
      ).catch(() => {})
    })
    return () => {
      mounted = false
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg" onClick={e => e.stopPropagation()}>
        <div id="barcode-reader" ref={ref} className="w-80 h-80" />
        <button onClick={onClose} className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg w-full">Cancel</button>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useRef } from 'react'
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentSlipUploadProps {
  studentId: string
  userId: string
  month: string
  gradeLevel: string
}

export function PaymentSlipUpload({ studentId, userId, month, gradeLevel }: PaymentSlipUploadProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus('idle')
      setErrorMessage('')
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setStatus('uploading')
      setErrorMessage('')

      const formData = new FormData()
      formData.append('file', file)
      formData.append('student', studentId)
      formData.append('user', userId)
      formData.append('month', month)
      formData.append('gradeLevel', gradeLevel)

      const response = await fetch('/api/payment-slips/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to upload payment slip.')
      }

      setStatus('success')
      setFile(null)

      // Refresh the server component page data
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Error uploading file')
    }
  }

  return (
    <div className="mt-4 border border-dashed border-[#034EA2]/30 rounded-lg p-5 bg-[#fcfdff]">
      <div className="flex flex-col items-center justify-center text-center">
        {status === 'success' ? (
          <div className="text-green-700 flex flex-col items-center">
            <CheckCircle2 className="size-10 text-green-600 mb-2" />
            <p className="font-semibold text-sm">Slip Uploaded Successfully!</p>
            <p className="text-xs text-green-600 mt-1">
              Your payment slip has been submitted. It is now awaiting review.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border border-[#034EA2]/15 hover:border-[#034EA2]/35 bg-white rounded-lg p-4 transition text-center shadow-sm"
            >
              <Upload className="size-6 text-[#034EA2]/75 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#034EA2]">
                {file ? file.name : 'Select Payment Slip (PDF or Image)'}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Max file size: 5MB</p>
            </div>

            {file && (status === 'idle' || status === 'error') && (
              <div className="mt-3.5 flex gap-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  className="flex-1 bg-[#034EA2] hover:bg-[#034EA2]/90 text-white rounded px-4 py-2.5 text-xs font-semibold shadow-sm transition"
                >
                  Submit Payment Slip
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setStatus('idle')
                    setErrorMessage('')
                  }}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 rounded px-4 py-2.5 text-xs font-semibold shadow-sm transition"
                >
                  Cancel
                </button>
              </div>
            )}

            {status === 'uploading' && (
              <div className="mt-3 flex items-center justify-center text-[#034EA2] text-xs font-semibold">
                <Loader2 className="size-4 animate-spin mr-1.5" />
                Uploading Slip...
              </div>
            )}

            {status === 'error' && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 justify-center text-red-700 bg-red-50 border border-red-200 rounded p-2 text-xs">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage || 'Failed to upload.'}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

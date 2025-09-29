import React, { useState } from 'react'
import UploadPanel from './components/UploadPanel'
import ChatPanel from './components/ChatPanel'

export default function App(){
  const [uploadId, setUploadId] = useState(null)
  const [sheets, setSheets] = useState([])
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">Excel NLP Analytics</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <UploadPanel onUploaded={(id, s)=>{ setUploadId(id); setSheets(s); }} />
        </div>
        <div className="col-span-2">
          <ChatPanel uploadId={uploadId} sheets={sheets} />
        </div>
      </div>
    </div>
  )
}

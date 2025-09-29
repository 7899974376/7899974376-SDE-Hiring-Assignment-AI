import React, {useState} from 'react'
import axios from 'axios'

export default function UploadPanel({onUploaded}){
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  async function doUpload(){
    if(!file) return
    setStatus('Uploading...')
    const fd = new FormData()
    fd.append('file', file)
    try{
      const r = await axios.post('http://localhost:8000/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setStatus('Uploaded')
      onUploaded(r.data.upload_id, r.data.sheets)
    }catch(e){
      setStatus('Error: ' + (e))
    }
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-medium mb-2">Upload Excel</h2>
      <input type="file" accept=".xls,.xlsx" onChange={e=>setFile(e.target.files[0])} />
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={doUpload}>Upload</button>
      </div>
      <p className="mt-2 text-sm text-gray-600">{status}</p>
    </div>
  )
}

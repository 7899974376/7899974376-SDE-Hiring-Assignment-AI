import React, {useState} from 'react'
import axios from 'axios'
import ChartRenderer from './ChartRenderer'

export default function ChatPanel({uploadId, sheets}){
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [lastResponse, setLastResponse] = useState(null)

  async function send(){
    if(!uploadId) return alert('Please upload first')
    const payload = { upload_id: uploadId, query: input }
    setMessages(prev=>[...prev, {role:'user', text: input}])
    setInput('')
    try{
      const r = await axios.post('http://localhost:8000/query', payload)
      setMessages(prev=>[...prev, {role:'assistant', text: JSON.stringify(r.data.rows.slice(0,5), null, 2)}])
      setLastResponse(r.data)
    }catch(e){
      setMessages(prev=>[...prev, {role:'assistant', text: 'Error: ' + (e?.response?.data?.detail || e.message)}])
    }
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <div className="mb-3">
        <div className="text-sm text-gray-500">Upload: {uploadId || '—'}</div>
        <div className="text-xs text-gray-400">Sheets: {sheets?.join(', ')}</div>
      </div>

      <div className="h-64 overflow-auto p-2 border rounded mb-3 bg-slate-50">
        {messages.map((m,i)=> (
          <div key={i} className={m.role==='user'? 'text-right text-sm':'text-left text-sm'}><pre>{m.text}</pre></div>
        ))}
      </div>

      <div className="flex gap-2">
        <input className="flex-1 border rounded p-2" value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask a question about your data..." />
        <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={send}>Ask</button>
      </div>

      <div className="mt-4">
        {lastResponse && <ChartRenderer data={lastResponse} />}
      </div>
    </div>
  )
}

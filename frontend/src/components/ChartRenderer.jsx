import React from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

export default function ChartRenderer({data}){
  const chart = data.chart || {type:'table'}
  const rows = data.rows || []
  if(chart.type === 'table'){
    return (
      <div className="overflow-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100"><tr>{Object.keys(rows[0]||{}).map(h=> <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i)=> (
            <tr key={i}>{Object.values(r).map((v, j)=>(<td key={j} className="p-2">{String(v)}</td>))}</tr>
          ))}</tbody>
        </table>
      </div>
    )
  }
  if(chart.type === 'bar'){
    const labels = rows.map(r=> r[chart.x])
    const ds = rows.map(r=> Number(r[chart.y]||0))
    const cfg = { labels, datasets:[{ label: chart.y, data: ds }] }
    return <div className="h-64"><Bar data={cfg} /></div>
  }
  if(chart.type === 'line'){
    const labels = rows.map(r=> r[chart.x])
    const ds = rows.map(r=> Number(r[chart.y]||0))
    const cfg = { labels, datasets:[{ label: chart.y, data: ds }] }
    return <div className="h-64"><Line data={cfg} /></div>
  }
  if(chart.type === 'histogram'){
    // render as bar of binned values (basic)
    const labels = rows.map((_, i)=> i+1)
    const ds = rows.map(r=> Number(r[chart.x]||0))
    const cfg = { labels, datasets:[{ label: chart.x, data: ds }] }
    return <div className="h-64"><Bar data={cfg} /></div>
  }
  return null
}

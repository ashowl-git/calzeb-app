// MonthlyEnergyChart.tsx
// CalZEB 월별 에너지 데이터 시각화
// Recharts 사용 (Plotly 대비 번들 크기 작음)

'use client'

import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Recharts CustomTooltip Props
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

interface MonthlyData {
  month: number
  heating: number
  cooling: number
  hot_water: number
  lighting: number
  ventilation: number
  pv_production: number
  total_consumption: number
  net_energy: number
}

interface MonthlyEnergyChartProps {
  data: MonthlyData[]
  area: number  // 연면적 추가
  title?: string
}

export default function MonthlyEnergyChart({ data, area, title = "월별 에너지 소비 패턴" }: MonthlyEnergyChartProps) {
  // 단위 상태 (absolute: kWh, unit: kWh/m²)
  const [unit, setUnit] = useState<'absolute' | 'unit'>('absolute')

  // 월 이름
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

  // 단위 변환 함수
  const convertValue = (value: number) => {
    if (unit === 'unit') {
      return area > 0 ? Math.round((value / area) * 100) / 100 : 0
    }
    return Math.round(value)
  }

  // 차트 데이터 변환
  const chartData = data.map(item => ({
    month: monthNames[item.month - 1],
    난방: convertValue(item.heating),
    냉방: convertValue(item.cooling),
    급탕: convertValue(item.hot_water),
    조명: convertValue(item.lighting),
    환기: convertValue(item.ventilation),
    신재생: convertValue(item.pv_production),
    총소비: convertValue(item.total_consumption),
    순에너지: convertValue(item.net_energy)
  }))

  // 단위 레이블
  const unitLabel = unit === 'absolute' ? 'kWh' : 'kWh/m²'

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-black p-4 shadow-lg">
          <p className="font-bold text-black mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} {unitLabel}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-12">
      {/* 제목 및 단위 토글 */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <h3 className="text-2xl font-black text-black">
          {title}
        </h3>

        {/* 단위 전환 토글 버튼 */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">단위:</span>
          <div className="flex border-2 border-black">
            <button
              onClick={() => setUnit('absolute')}
              className={`px-4 py-2 text-sm font-bold transition-colors ${
                unit === 'absolute'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              kWh
            </button>
            <button
              onClick={() => setUnit('unit')}
              className={`px-4 py-2 text-sm font-bold transition-colors border-l-2 border-black ${
                unit === 'unit'
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              kWh/m²
            </button>
          </div>
        </div>
      </div>

      {/* 1. 월별 에너지원별 소비 (적층 막대 차트) */}
      <div>
        <h4 className="text-lg font-bold text-black mb-4">
          월별 에너지원별 소비량 ({unitLabel})
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#000" style={{ fontSize: '12px', fontWeight: 'bold' }} />
            <YAxis stroke="#000" style={{ fontSize: '12px', fontWeight: 'bold' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
            <Bar dataKey="난방" stackId="a" fill="#ef4444" />
            <Bar dataKey="냉방" stackId="a" fill="#3b82f6" />
            <Bar dataKey="급탕" stackId="a" fill="#f59e0b" />
            <Bar dataKey="조명" stackId="a" fill="#eab308" />
            <Bar dataKey="환기" stackId="a" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2 text-center">
          겨울철(1-3월, 11-12월) 난방 비중 높음 | 여름철(6-8월) 냉방 비중 높음
        </p>
      </div>

      {/* 2. 월별 총 소비 vs 신재생 vs 순 에너지 (라인 차트) */}
      <div>
        <h4 className="text-lg font-bold text-black mb-4">
          월별 에너지 수지 ({unitLabel})
        </h4>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#000" style={{ fontSize: '12px', fontWeight: 'bold' }} />
            <YAxis stroke="#000" style={{ fontSize: '12px', fontWeight: 'bold' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px', fontWeight: 'bold' }} />
            <Line type="monotone" dataKey="총소비" stroke="#dc2626" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="신재생" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }} />
            <Line type="monotone" dataKey="순에너지" stroke="#000" strokeWidth={4} dot={{ r: 6, fill: '#000' }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2 text-center">
          검은색 선(순 에너지) = 총 소비 - 신재생 생산
        </p>
      </div>

      {/* 3. 월별 데이터 테이블 (상세) */}
      <div>
        <h4 className="text-lg font-bold text-black mb-4">
          월별 상세 데이터 ({unitLabel})
        </h4>
        <div className="overflow-x-auto border-2 border-black">
          <table className="w-full text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-3 font-bold text-left">월</th>
                <th className="p-3 font-bold text-right">난방</th>
                <th className="p-3 font-bold text-right">냉방</th>
                <th className="p-3 font-bold text-right">급탕</th>
                <th className="p-3 font-bold text-right">조명</th>
                <th className="p-3 font-bold text-right">환기</th>
                <th className="p-3 font-bold text-right">총소비</th>
                <th className="p-3 font-bold text-right text-green-400">신재생</th>
                <th className="p-3 font-bold text-right">순에너지</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-200">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-3 font-bold">{row.month}</td>
                  <td className="p-3 text-right text-red-600 font-semibold">
                    {row.난방.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-blue-600 font-semibold">
                    {row.냉방.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-orange-600 font-semibold">
                    {row.급탕.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-yellow-600 font-semibold">
                    {row.조명.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-purple-600 font-semibold">
                    {row.환기.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-bold border-l-2 border-gray-300">
                    {row.총소비.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-green-600 font-bold">
                    {row.신재생.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-black bg-gray-100">
                    {row.순에너지.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-black text-white font-bold">
              <tr>
                <td className="p-3">연간</td>
                <td className="p-3 text-right">
                  {chartData.reduce((sum, row) => sum + row.난방, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {chartData.reduce((sum, row) => sum + row.냉방, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {chartData.reduce((sum, row) => sum + row.급탕, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {chartData.reduce((sum, row) => sum + row.조명, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  {chartData.reduce((sum, row) => sum + row.환기, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right border-l-2 border-white">
                  {chartData.reduce((sum, row) => sum + row.총소비, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right text-green-400">
                  {chartData.reduce((sum, row) => sum + row.신재생, 0).toLocaleString()}
                </td>
                <td className="p-3 text-right bg-white text-black">
                  {chartData.reduce((sum, row) => sum + row.순에너지, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

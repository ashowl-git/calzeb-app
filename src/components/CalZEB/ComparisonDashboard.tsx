'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface Alternative {
  id: number;
  alt_name: string;
  building_type: string;
  area: number;
  location: string;
  primary_energy: number;
  self_sufficiency_rate?: number;
  zeb_grade?: string;
  zeb_grade_numeric?: number;
  calculation_results?: any;
  renewable_energy: number;
  renewable_ratio: number;
  co2_emissions: number;
  score: number;
  investment_cost: number;
  operational_cost: number;
  npv?: number;
  irr?: number;
  payback_period?: number;
}

interface ComparisonDashboardProps {
  projectId: number;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ projectId }) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('primary_energy');
  const [sortBy, setSortBy] = useState('score');
  const [filterType, setFilterType] = useState('all');

  const fetchAlternatives = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works';
      const response = await fetch(`${apiUrl}/calzeb/projects/${projectId}/alternatives`);

      console.log('[ComparisonDashboard] 응답 상태:', response.status);

      const data = await response.json();
      console.log('[ComparisonDashboard] Alternative 데이터:', data);

      setAlternatives(data.alternatives || []);
    } catch (error) {
      console.error('[ComparisonDashboard] 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAlternatives();
  }, [fetchAlternatives]);

  const exportToExcel = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.askwhy.works';
      const response = await fetch(`${apiUrl}/api/calzeb/projects/${projectId}/export-results`);

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calzeb_comparison_${projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Filter and sort alternatives (실제 API 데이터 매핑)
  const processedAlternatives = alternatives
    .map(alt => {
      // calculation_results에서 데이터 추출
      const calc = alt.calculation_results || {}
      const annual = calc.annual_summary || {}
      const econ = calc.economic_analysis || {}

      // ZEB 점수 계산 (1++ = 100점, 5등급 = 50점, 미인증 = 0점)
      let score = 0
      if (alt.zeb_grade === '1++') score = 100
      else if (alt.zeb_grade === '1+') score = 95
      else if (alt.zeb_grade === '1') score = 90
      else if (alt.zeb_grade === '2') score = 80
      else if (alt.zeb_grade === '3') score = 70
      else if (alt.zeb_grade === '4') score = 60
      else if (alt.zeb_grade === '5') score = 50
      else score = 0  // 미인증

      return {
        ...alt,
        renewable_energy: annual.total_renewable_production_1st || 0,
        renewable_ratio: alt.self_sufficiency_rate || 0,
        co2_emissions: 0,  // TODO: 환경성 분석에서 추가
        score: score,
        investment_cost: econ.capex ? econ.capex / alt.area / 1000 : 0,  // 천원/m²
        operational_cost: econ.annual_opex || 0,
        npv: econ.npv_20y || 0,
        irr: 0,  // TODO: IRR 계산 추가
        payback_period: econ.payback_years || 0
      }
    })
    .filter(alt => filterType === 'all' || alt.building_type === filterType)
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Alternative] as number;
      const bVal = b[sortBy as keyof Alternative] as number;
      return sortBy === 'score' ? bVal - aVal : aVal - bVal;
    });

  // Metrics for comparison
  const metrics = [
    { key: 'primary_energy', label: '1차 에너지', unit: 'kWh/m²·yr' },
    { key: 'renewable_ratio', label: '신재생 비율', unit: '%' },
    { key: 'co2_emissions', label: 'CO2 배출량', unit: 'kgCO₂/m²·yr' },
    { key: 'investment_cost', label: '투자비', unit: '천원/m²' },
    { key: 'score', label: 'ZEB 점수', unit: '점' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 text-sm font-bold focus:outline-none focus:border-black"
          >
            {metrics.map(metric => (
              <option key={metric.key} value={metric.key}>
                {metric.label}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 text-sm font-bold focus:outline-none focus:border-black"
          >
            <option value="score">ZEB 점수</option>
            <option value="primary_energy">1차 에너지</option>
            <option value="renewable_ratio">신재생 비율</option>
            <option value="investment_cost">투자비</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 text-sm font-bold focus:outline-none focus:border-black"
          >
            <option value="all">전체</option>
            <option value="office">업무용</option>
            <option value="residential">주거용</option>
            <option value="commercial">상업용</option>
          </select>
        </div>

        <button
          onClick={exportToExcel}
          className="border-2 border-red-600 bg-red-600 text-white px-6 py-2 text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel 내보내기
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-2 border-gray-200 p-4 bg-white">
          <div className="text-xs font-bold text-gray-500 mb-2">총 Alternative</div>
          <div className="text-2xl font-bold">{processedAlternatives.length}</div>
        </div>

        <div className="border-2 border-gray-200 p-4 bg-white">
          <div className="text-xs font-bold text-gray-500 mb-2">평균 ZEB 점수</div>
          <div className="text-2xl font-bold">
            {(processedAlternatives.reduce((sum, alt) => sum + alt.score, 0) / processedAlternatives.length || 0).toFixed(1)}점
          </div>
        </div>

        <div className="border-2 border-gray-200 p-4 bg-white">
          <div className="text-xs font-bold text-gray-500 mb-2">최고 신재생 비율</div>
          <div className="text-2xl font-bold">
            {Math.max(...processedAlternatives.map(alt => alt.renewable_ratio), 0).toFixed(1)}%
          </div>
        </div>

        <div className="border-2 border-gray-200 p-4 bg-white">
          <div className="text-xs font-bold text-gray-500 mb-2">최저 탄소배출</div>
          <div className="text-2xl font-bold">
            {Math.min(...processedAlternatives.map(alt => alt.co2_emissions), 999).toFixed(1)} kg/m²
          </div>
        </div>
      </div>

      {/* Main Comparison Chart */}
      <div className="border-2 border-gray-200 p-6 bg-white">
        <h3 className="text-xl font-bold text-black mb-2">Alternative 비교 분석</h3>
        <p className="text-sm text-gray-600 mb-4">
          {metrics.find(m => m.key === selectedMetric)?.label} 기준
        </p>
        <Plot
          data={[
            {
              x: processedAlternatives.map(alt => alt.alt_name),
              y: processedAlternatives.map(alt => alt[selectedMetric as keyof Alternative] as number),
              type: 'bar',
              marker: {
                color: processedAlternatives.map(alt => {
                  if (selectedMetric === 'score' || selectedMetric === 'renewable_ratio') {
                    return alt[selectedMetric] > 80 ? '#10b981' : alt[selectedMetric] > 60 ? '#3b82f6' : '#ef4444';
                  } else {
                    return '#3b82f6';
                  }
                }),
              },
              text: processedAlternatives.map(alt => {
                const value = alt[selectedMetric as keyof Alternative] as number;
                const metric = metrics.find(m => m.key === selectedMetric);
                return `${value.toFixed(1)} ${metric?.unit || ''}`;
              }),
              textposition: 'outside',
            },
          ]}
          layout={{
            title: { text: '' },
            xaxis: {
              title: { text: 'Alternative' },
              tickangle: -45,
            },
            yaxis: {
              title: { text: metrics.find(m => m.key === selectedMetric)?.label || '' },
            },
            height: 400,
            margin: {
              l: 50,
              r: 50,
              b: 100,
              t: 20,
            },
            showlegend: false,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Scatter Plot - Energy vs Cost */}
      <div className="border-2 border-gray-200 p-6 bg-white">
        <h3 className="text-xl font-bold text-black mb-2">에너지 vs 비용 분석</h3>
        <p className="text-sm text-gray-600 mb-4">1차 에너지 소비량과 투자비의 관계</p>
        <Plot
          data={[
            {
              x: processedAlternatives.map(alt => alt.primary_energy),
              y: processedAlternatives.map(alt => alt.investment_cost),
              mode: 'text+markers',
              type: 'scatter',
              text: processedAlternatives.map(alt => alt.alt_name),
              textposition: 'top center',
              marker: {
                size: processedAlternatives.map(alt => alt.renewable_ratio / 5 + 10),
                color: processedAlternatives.map(alt => alt.score),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                  title: { text: 'ZEB 점수' },
                },
              },
            },
          ]}
          layout={{
            title: { text: '' },
            xaxis: {
              title: { text: '1차 에너지 (kWh/m²·yr)' },
            },
            yaxis: {
              title: { text: '투자비 (천원/m²)' },
            },
            height: 400,
            showlegend: false,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Radar Chart - Multi-dimensional Comparison */}
      <div className="border-2 border-gray-200 p-6 bg-white">
        <h3 className="text-xl font-bold text-black mb-2">다차원 성능 비교</h3>
        <p className="text-sm text-gray-600 mb-4">상위 5개 Alternative 종합 비교</p>
        <Plot
          data={processedAlternatives.slice(0, 5).map((alt, idx) => ({
            type: 'scatterpolar',
            r: [
              (100 - alt.primary_energy) / 100 * 5,
              alt.renewable_ratio / 20,
              (100 - alt.co2_emissions) / 20,
              alt.score / 20,
              (1000 - alt.investment_cost) / 200,
            ],
            theta: ['에너지 효율', '신재생', 'CO2 저감', 'ZEB 점수', '경제성'],
            fill: 'toself',
            name: alt.alt_name,
            marker: {
              color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx],
            },
          }))}
          layout={{
            polar: {
              radialaxis: {
                visible: true,
                range: [0, 5],
              },
            },
            height: 400,
            showlegend: true,
          }}
          config={{
            displayModeBar: false,
            responsive: true,
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Recommendation Section */}
      <div className="border-2 border-gray-200 p-6 bg-white">
        <h3 className="text-xl font-bold text-black mb-2">추천 Alternative</h3>
        <p className="text-sm text-gray-600 mb-4">종합 성능 기준 상위 3개</p>
        <div className="space-y-4">
          {processedAlternatives.slice(0, 3).map((alt, idx) => (
            <div key={alt.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-500">#{idx + 1}</div>
                <div>
                  <h3 className="font-semibold text-black">{alt.alt_name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="border border-gray-400 px-2 py-1 text-xs">ZEB {alt.score.toFixed(0)}점</span>
                    <span className="border border-gray-400 px-2 py-1 text-xs">신재생 {alt.renewable_ratio.toFixed(1)}%</span>
                    <span className="border border-gray-400 px-2 py-1 text-xs">CO₂ {alt.co2_emissions.toFixed(1)}kg/m²</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">1차 에너지</div>
                <div className="font-semibold">{alt.primary_energy.toFixed(1)} kWh/m²·yr</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
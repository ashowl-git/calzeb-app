// CalZEB TypeScript Types

export interface Project {
  project_id: number
  name: string
  description?: string
  tags?: string[]
  building_type: string
  area: number
  location: string
  calculation_mode: 'simple' | 'detailed'
  alternatives_count: number
  created_at: string
  updated_at: string
}

export interface Alternative {
  alternative_id: number
  project_id: number
  alt_name: string
  description?: string
  zeb_grade: string
  self_sufficiency_rate: number
  display_order: number
  created_at: string
}

export interface MonthlyData {
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

export interface CalculationResults {
  building_type: string
  area: number
  location: string
  zeb_grade: string
  self_sufficiency_rate: number
  annual_summary: {
    heating: number
    cooling: number
    hot_water: number
    lighting: number
    ventilation: number
    total_consumption_1st: number
    total_renewable_production_1st: number
    self_sufficiency_rate: number
    zeb_grade: string
    energy_efficiency_1pp: boolean
  }
  monthly: MonthlyData[]
}

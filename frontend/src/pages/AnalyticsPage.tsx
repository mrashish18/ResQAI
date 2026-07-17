import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Activity } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { analyticsAPI } from '../lib/api'
import type { AnalyticsSummary, IncidentTrend } from '../types'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [trends, setTrends] = useState<IncidentTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, trendRes] = await Promise.all([
          analyticsAPI.summary(),
          analyticsAPI.trends()
        ])
        setSummary(sumRes.data)
        setTrends(trendRes.data)
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const lineChartData = {
    labels: trends.map(t => t.date),
    datasets: [
      {
        label: 'Incidents Over Time',
        data: trends.map(t => t.count),
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  // Aggregate by type for Doughnut chart
  const typeCounts = trends.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + curr.count
    return acc
  }, {} as Record<string, number>)

  const doughnutData = {
    labels: Object.keys(typeCounts).map(t => t.toUpperCase()),
    datasets: [
      {
        data: Object.values(typeCounts),
        backgroundColor: [
          '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'
        ],
        borderWidth: 0,
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94A3B8' } }
    },
    scales: {
      x: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94A3B8' } },
      y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94A3B8' } }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: '#94A3B8' } }
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-black text-white mb-1"><span className="gradient-text">Analytics</span> Dashboard</h1>
          <p className="text-gray-400">Data-driven insights into disasters, responses, and resource allocation.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="w-12 h-12 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6 border-t-4 border-[#EF4444]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold mb-1">Active Incidents</p>
                    <h3 className="text-3xl font-bold text-white">{summary?.active_incidents || 0}</h3>
                  </div>
                  <div className="p-3 bg-red-500/20 rounded-lg text-red-500"><Activity size={24} /></div>
                </div>
              </div>
              <div className="glass-card p-6 border-t-4 border-[#3B82F6]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold mb-1">People Rescued</p>
                    <h3 className="text-3xl font-bold text-white">{summary?.people_rescued || 0}</h3>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500"><Users size={24} /></div>
                </div>
              </div>
              <div className="glass-card p-6 border-t-4 border-[#10B981]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold mb-1">Resolved Incidents</p>
                    <h3 className="text-3xl font-bold text-white">{summary?.resolved_incidents || 0}</h3>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-lg text-green-500"><CheckCircleIcon size={24} /></div>
                </div>
              </div>
              <div className="glass-card p-6 border-t-4 border-[#8B5CF6]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm font-semibold mb-1">Response Time Avg</p>
                    <h3 className="text-3xl font-bold text-white">{summary?.response_time_avg ? `${summary.response_time_avg}m` : 'N/A'}</h3>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-lg text-purple-500"><TrendingUp size={24} /></div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6 lg:col-span-2 min-h-[400px]">
                <h3 className="text-xl font-bold text-white mb-6">Incident Trends (Last 30 Days)</h3>
                <div className="h-[300px]">
                  <Line data={lineChartData} options={chartOptions as any} />
                </div>
              </div>
              <div className="glass-card p-6 min-h-[400px]">
                <h3 className="text-xl font-bold text-white mb-6">Incidents by Type</h3>
                <div className="h-[300px]">
                  {Object.keys(typeCounts).length > 0 ? (
                    <Doughnut data={doughnutData} options={doughnutOptions as any} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

// Inline component for the check icon
const CheckCircleIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

export default AnalyticsPage

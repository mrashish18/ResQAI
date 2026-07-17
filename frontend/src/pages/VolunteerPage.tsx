import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HeartHandshake, CheckCircle2, Clock, MapPin, Target } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { volunteersAPI } from '../lib/api'
import type { VolunteerTask } from '../types'
import toast from 'react-hot-toast'
import SeverityBadge from '../components/SeverityBadge'
import { useAuth } from '../context/AuthContext'

const VolunteerPage: React.FC = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<VolunteerTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await volunteersAPI.tasks()
      setTasks(res.data)
    } catch (error) {
      toast.error("Failed to load volunteer tasks")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptTask = async (taskId: number) => {
    try {
      await volunteersAPI.acceptTask(taskId)
      toast.success("Task accepted!")
      fetchTasks()
    } catch (error) {
      toast.error("Failed to accept task")
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    try {
      await volunteersAPI.completeTask(taskId)
      toast.success("Task completed!")
      fetchTasks()
    } catch (error) {
      toast.error("Failed to complete task")
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Volunteer <span className="gradient-text">Board</span></h1>
            <p className="text-gray-400">View and accept community assistance tasks during crises.</p>
          </div>
          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
            <HeartHandshake className="w-5 h-5" /> 
            You are ready to help!
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: idx * 0.05 }}
                key={task.id} 
                className="glass-card p-6 flex flex-col h-full border-t-4"
                style={{ borderColor: task.status === 'open' ? '#F59E0B' : '#10B981' }}
              >
                <div className="flex justify-between items-start mb-3">
                  <SeverityBadge severity={task.priority} />
                  <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${task.status === 'open' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                    {task.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                <p className="text-sm text-gray-400 mb-4 flex-1">{task.description}</p>
                
                <div className="space-y-3 mb-6 bg-[#0F172A] p-4 rounded-xl border border-gray-800">
                  <div className="flex items-start gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-300">
                    <Target className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {task.required_skills.map((skill, i) => (
                        <span key={i} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>Due: {new Date(task.due_date).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {task.status === 'open' ? (
                  <button onClick={() => handleAcceptTask(task.id)} className="btn-primary w-full py-3" style={{ background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)', borderColor: '#059669' }}>
                    Accept Task
                  </button>
                ) : task.status === 'accepted' && task.assigned_to === user?.id ? (
                  <button onClick={() => handleCompleteTask(task.id)} className="btn-primary w-full py-3" style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)', borderColor: '#2563EB' }}>
                    Mark Completed
                  </button>
                ) : (
                  <button disabled className="btn-glass w-full py-3 opacity-50 flex justify-center items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={18} /> {task.status === 'completed' ? 'Task Completed' : 'Task Assigned'}
                  </button>
                )}
              </motion.div>
            ))}

            {tasks.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                <HeartHandshake className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Tasks</h3>
                <p>There are no volunteer tasks available in your area right now.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default VolunteerPage

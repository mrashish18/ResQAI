import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, BrainCircuit, Activity, ShieldAlert, Navigation } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { chatbotAPI, predictionsAPI } from '../lib/api'
import toast from 'react-hot-toast'
import SeverityBadge from '../components/SeverityBadge'

const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'prediction'>('chat')

  // Chatbot State
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([
    { role: 'bot', content: 'Hello! I am the ResQAI Assistant. Ask me about disaster preparedness, emergency protocols, or live updates.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)

  // Prediction State
  const [predForm, setPredForm] = useState({ location: '', latitude: '', longitude: '', disaster_type: 'flood' })
  const [predResult, setPredResult] = useState<any>(null)
  const [isPredLoading, setIsPredLoading] = useState(false)

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const newMessages = [...messages, { role: 'user' as const, content: chatInput }]
    setMessages(newMessages)
    setChatInput('')
    setIsChatLoading(true)

    try {
      const res = await chatbotAPI.send(chatInput)
      setMessages([...newMessages, { role: 'bot', content: res.data.response }])
    } catch (error) {
      toast.error("Failed to reach AI Chatbot")
      setMessages([...newMessages, { role: 'bot', content: "Sorry, I'm having trouble connecting right now." }])
    } finally {
      setIsChatLoading(false)
    }
  }

  const handlePredSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!predForm.location || !predForm.latitude || !predForm.longitude) {
      toast.error("Please fill in all fields")
      return
    }
    setIsPredLoading(true)
    try {
      const res = await predictionsAPI.analyze({
        location: predForm.location,
        latitude: parseFloat(predForm.latitude),
        longitude: parseFloat(predForm.longitude),
        disaster_type: predForm.disaster_type
      })
      setPredResult(res.data)
      toast.success("Analysis complete")
    } catch (error) {
      toast.error("Failed to generate prediction")
    } finally {
      setIsPredLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0B1220' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white mb-1"><span className="gradient-text">AI</span> Assistant</h1>
            <p className="text-gray-400">AI-powered disaster prediction and emergency guidance chatbot.</p>
          </div>
          
          <div className="flex bg-[#1E293B] rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'chat' ? 'bg-[#3B82F6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Bot className="w-4 h-4 inline-block mr-2" /> Chatbot
            </button>
            <button 
              onClick={() => setActiveTab('prediction')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'prediction' ? 'bg-[#8B5CF6] text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <BrainCircuit className="w-4 h-4 inline-block mr-2" /> Risk Prediction
            </button>
          </div>
        </motion.div>

        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card flex flex-col h-[70vh] rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${msg.role === 'user' ? 'bg-[#3B82F6] text-white' : 'bg-[#1E293B] text-gray-200 border border-gray-700'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1E293B] border border-gray-700 text-gray-400 rounded-2xl px-5 py-3 flex gap-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-800 bg-[#0F172A]/50 backdrop-blur-md">
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about disaster safety, evacuation, or SOS..." 
                  className="input-field flex-1"
                  disabled={isChatLoading}
                />
                <button type="submit" disabled={isChatLoading || !chatInput.trim()} className="btn-primary px-6 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === 'prediction' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Navigation className="text-[#8B5CF6] w-5 h-5" /> Analyze Location Risk
              </h2>
              <form onSubmit={handlePredSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Location Name</label>
                  <input type="text" className="input-field w-full" value={predForm.location} onChange={e => setPredForm({...predForm, location: e.target.value})} placeholder="e.g., Coastal Mumbai" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Latitude</label>
                    <input type="number" step="any" className="input-field w-full" value={predForm.latitude} onChange={e => setPredForm({...predForm, latitude: e.target.value})} placeholder="19.0760" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Longitude</label>
                    <input type="number" step="any" className="input-field w-full" value={predForm.longitude} onChange={e => setPredForm({...predForm, longitude: e.target.value})} placeholder="72.8777" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Disaster Type</label>
                  <select className="input-field w-full" value={predForm.disaster_type} onChange={e => setPredForm({...predForm, disaster_type: e.target.value})}>
                    <option value="flood">Flood</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="wildfire">Wildfire</option>
                    <option value="tsunami">Tsunami</option>
                    <option value="landslide">Landslide</option>
                  </select>
                </div>
                <button type="submit" disabled={isPredLoading} className="btn-primary w-full mt-4 flex justify-center items-center gap-2" style={{ background: 'linear-gradient(90deg, #8B5CF6 0%, #3B82F6 100%)' }}>
                  {isPredLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Activity className="w-5 h-5" /> Run AI Analysis</>}
                </button>
              </form>
            </div>

            <div className="glass-card p-6 flex flex-col items-center justify-center min-h-[300px]" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
              {predResult ? (
                <div className="w-full text-center fade-in">
                  <ShieldAlert className="w-16 h-16 mx-auto mb-4" style={{ color: predResult.risk_level === 'extreme' ? '#EF4444' : predResult.risk_level === 'high' ? '#F97316' : '#EAB308' }} />
                  <h3 className="text-2xl font-bold text-white mb-2">{predResult.location_name}</h3>
                  <div className="flex justify-center gap-4 mb-6">
                    <SeverityBadge severity={predResult.risk_level} />
                    <span className="bg-[#1E293B] text-gray-300 px-3 py-1 rounded-full text-sm flex items-center gap-1 border border-gray-700">
                      <BrainCircuit size={14} /> {(predResult.confidence_score * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <div className="bg-[#1E293B] p-4 rounded-xl text-left border border-gray-800 text-gray-300">
                    <p>{predResult.details}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter coordinates and run analysis to view AI predictions.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default AIPage

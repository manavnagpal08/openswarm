import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../context/SimulationContext';
import { MessageSquare, Mic, X, Send, Cpu, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AiAssistant: React.FC = () => {
  const navigate = useNavigate();
  const { machines } = useSimulation();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Detroit plant-floor AI copilot online. Ask me about system health, specific devices or route commands.' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Simple rule-based logic to respond to user input or voice commands
  const processCommand = (commandText: string) => {
    const cleanCmd = commandText.toLowerCase().trim();
    
    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: commandText }]);

    setTimeout(() => {
      if (cleanCmd.includes('critical') || cleanCmd.includes('show critical')) {
        const criticalList = machines.filter(m => m.status === 'critical').map(m => m.id).join(', ');
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: `Retrieved critical nodes: ${criticalList || 'None'}. Redirecting to governance dashboard...`
        }]);
        navigate('/governance');
      } else if (cleanCmd.includes('open device') || cleanCmd.includes('dev-')) {
        const matched = cleanCmd.match(/dev-\d+/);
        const deviceId = matched ? matched[0].toUpperCase() : 'DEV-010';
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: `Opening localized cockpit operations for device ${deviceId}...`
        }]);
        navigate(`/device-operations?id=${deviceId}`);
      } else if (cleanCmd.includes('analytics') || cleanCmd.includes('show analytics')) {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: 'Opening plant-wide Enterprise Analytics panels...'
        }]);
        navigate('/analytics');
      } else if (cleanCmd.includes('report') || cleanCmd.includes('generate today')) {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: 'Generated plant summary report INC-2026. File queued for PDF download.'
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: `Copilot processed message: "${commandText}". Command not indexed. Type 'show critical devices' or 'open device DEV-010'.`
        }]);
      }
    }, 750);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput('');
  };

  // Mock voice commands listener (utilizing Speech Recognition if supported, or falling back)
  const handleVoiceListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    
    // Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const speechResult = event.results[0][0].transcript;
        processCommand(speechResult);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      // Mock Speech recognition fallback after 3 seconds
      setTimeout(() => {
        if (isListening) {
          processCommand('Show critical devices');
          setIsListening(false);
        }
      }, 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-60 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="w-80 h-96 bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-black text-slate-800 uppercase flex items-center gap-2">
                <Cpu size={14} className="text-blue-600 animate-pulse" /> Sentinel Industrial Copilot
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[10px] leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-50 border border-slate-200 text-slate-700'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 items-center bg-slate-50/50">
              <button
                type="button"
                onClick={handleVoiceListen}
                className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                  isListening 
                    ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
                title="Voice Command"
              >
                <Mic size={14} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type command..."
                className="flex-1 px-3 py-1.5 border border-slate-250 rounded-xl text-[10px] focus:outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                className="p-2 bg-blue-650 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-blue-500/10 cursor-pointer"
      >
        <MessageSquare size={20} />
      </motion.button>
    </div>
  );
};
export default AiAssistant;

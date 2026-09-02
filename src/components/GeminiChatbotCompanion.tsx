import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  Trash2, 
  CornerDownLeft, 
  Loader2, 
  ArrowRight,
  ClipboardCheck,
  ClipboardCopy,
  BrainCircuit,
  MessageCircleOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeminiChatbotCompanionProps {
  roleType: 'lesson_plan' | 'worksheet' | 'quiz';
  subject?: string;
  grade?: string;
  currentTitle?: string;
  onSuggestionApply?: (text: string) => void;
  onClose?: () => void;
}

const DEFAULT_SUGGESTIONS = {
  lesson_plan: [
    { label: '🔬 Inquiry Hook', text: 'Suggest an engaging hands-on laboratory hook and initial problem-solving scenario.' },
    { label: '🔄 5E Structure', text: 'Structure a detailed daily lesson plan outline using the 5E Instructional Cycle.' },
    { label: '🌐 ELL Scaffolding', text: 'Recommend specialized bilingual vocabulary lists and sentence-starter accommodations.' },
    { label: '📝 Evaluation Rubric', text: 'Design a criteria-referenced rubric and 3-item formative exit ticket questions.' }
  ],
  worksheet: [
    { label: '🎯 3 MCQs Ideas', text: 'Draft 3 creative multiple-choice question ideas with distinct options and answer explanations.' },
    { label: '🖊️ Short-Answer Prompts', text: 'Provide 2 high-rigor short-answer questions focusing on analytical conceptual synthesis.' },
    { label: '🏷️ Diagram Labeling', text: 'Suggest a creative diagram labeling question explaining key structural functions.' },
    { label: '💡 Real-world Application', text: 'Formulate an authentic real-world case study question connecting theory to practice.' }
  ],
  quiz: [
    { label: '🔥 High-Rigor MCQ', text: 'Draft a high-rigor multiple choice question with common distractor misconceptions explained.' },
    { label: '⭐ Calibration Guide', text: 'Suggest diagnostic questions calibrated across Novice, Intermediate, and Master difficulty.' },
    { label: '📚 Explanations Key', text: 'Write step-by-step explanatory feedback for a complex multi-variable quiz problem.' },
    { label: '🛑 Common Traps', text: 'Create quiz items that specifically address common student misunderstandings in this unit.' }
  ]
};

const ROLE_META = {
  lesson_plan: {
    title: 'Curriculum Co-pilot',
    systemInstruction: 'You are an Elite Academic Curriculum Designer and Lesson Planner at Dewey International School (DIS). Your goal is to guide the teacher in brainstorming, creating, refining, and restructuring their lesson plan. Offer standard alignments, active learning strategies, engagement hooks, and assessment checklists. Keep your answers clear, concise, and formatted in clean Markdown.',
    greeting: "Hello Educator! I'm your Dewey Curriculum Co-pilot. Let's design an outstanding lesson plan together. Ask me to structure activities, write objectives, or draft standard alignments!"
  },
  worksheet: {
    title: 'Worksheet Architect',
    systemInstruction: 'You are an Expert Worksheet Architect and Educational Material Designer at Dewey International School (DIS). Your goal is to help teachers design highly engaging, clear worksheets, formulate short-answer or multiple-choice questions, write helpful student hints, and outline vocabulary lists. Keep your answers practical, precise, and formatted in clean Markdown.',
    greeting: "Welcome! I'm your Worksheet Architect. Ready to formulate engaging question banks, diagram labeling prompts, or custom student worksheets. What topic should we explore?"
  },
  quiz: {
    title: 'Assessment Specialist',
    systemInstruction: 'You are an Elite Assessment Specialist and Exam Creator at Dewey International School (DIS). Your goal is to help teachers construct high-fidelity quiz questions, calibrate question difficulty (Novice, Intermediate, Master), design diagnostic questions, and write clear answer explanations to promote student self-correction. Keep your answers precise, authoritative, and formatted in clean Markdown.',
    greeting: "Greetings! I'm your Dewey Assessment Specialist. Let's calibrate high-rigor quiz questions, write comprehensive answer keys, or target common student misconceptions together!"
  }
};

export const GeminiChatbotCompanion: React.FC<GeminiChatbotCompanionProps> = ({
  roleType,
  subject = 'Science',
  grade = '9',
  currentTitle = '',
  onSuggestionApply,
  onClose
}) => {
  const meta = ROLE_META[roleType];
  const suggestions = DEFAULT_SUGGESTIONS[roleType];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: meta.greeting + (currentTitle ? ` I can see you are working on "${currentTitle}" for Grade ${grade} ${subject}!` : ''),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const contextInstruction = `${meta.systemInstruction}\n\nUser Current Context:\n- Subject: ${subject}\n- Grade: Grade ${grade}\n- Current Topic Title: ${currentTitle || 'Not set yet'}\n\nAlways offer direct suggestions, standard codes, or sample questions in clear, concise markdown blocks so the teacher can easily adapt them.`;

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          systemInstruction: contextInstruction,
          roleType: meta.title
        })
      });

      const result = await response.json();

      const assistantMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: result.text || "I'm sorry, I couldn't process that query. Please ask me again or try a suggested topic!",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-assistant-err`,
        role: 'assistant',
        content: "⚠️ **Connection Error**: I was unable to reach the Dewey AI Server. Please ensure you are connected or check your server configuration.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear this chat conversation history?')) {
      setMessages([
        {
          id: 'welcome-msg-reset',
          role: 'assistant',
          content: meta.greeting,
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyText = (text: string, msgId: string) => {
    if (onSuggestionApply) {
      // Strip markdown code headers or format markers if present
      let cleanText = text.replace(/```markdown/gi, '')
                          .replace(/```json/gi, '')
                          .replace(/```/g, '')
                          .trim();
      onSuggestionApply(cleanText);
      setAppliedId(msgId);
      setTimeout(() => setAppliedId(null), 2000);
    }
  };

  return (
    <div id="gemini-chatbot-companion-wrapper" className="flex flex-col h-full bg-slate-900 text-slate-100 border-l border-slate-700 shadow-2xl relative">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
            <Bot size={15} className="animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-300 block">
              Dewey AI Companion
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              {meta.title} • {subject} G{grade}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {messages.length > 1 && (
            <button
              onClick={handleClearHistory}
              title="Clear Conversation History"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              title="Hide AI Assistant"
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] flex flex-col gap-1`}>
                  {/* Bubble */}
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed font-medium shadow-md ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-bl-none'
                    }`}
                  >
                    {/* Render message formatting / breaks gracefully */}
                    <div className="whitespace-pre-line break-words prose prose-invert max-w-none text-[12px] sm:text-[13px]">
                      {m.content}
                    </div>

                    {/* Actions Panel for assistant responses (Copy / Apply) */}
                    {!isUser && m.id !== 'welcome-msg' && m.id !== 'welcome-msg-reset' && (
                      <div className="flex items-center justify-end gap-2 mt-2.5 pt-2 border-t border-slate-700/40 text-[10.5px]">
                        <button
                          type="button"
                          onClick={() => handleCopyText(m.content, m.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer font-semibold"
                        >
                          {copiedId === m.id ? (
                            <>
                              <ClipboardCheck size={11} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <ClipboardCopy size={11} />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>

                        {onSuggestionApply && (
                          <button
                            type="button"
                            onClick={() => handleApplyText(m.content, m.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-200 hover:text-white border border-indigo-800/60 transition-colors cursor-pointer font-bold"
                          >
                            {appliedId === m.id ? (
                              <>
                                <ClipboardCheck size={11} className="text-amber-300" />
                                <span className="text-amber-300">Applied!</span>
                              </>
                            ) : (
                              <>
                                <CornerDownLeft size={11} />
                                <span>Apply to Form</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Timestamp / Sender identifier */}
                  <span className={`text-[9.5px] text-slate-500 font-bold self-${isUser ? 'end' : 'start'} px-1`}>
                    {isUser ? 'You' : meta.title} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading Indicator Bubble */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className="p-3 bg-slate-800 text-slate-300 border border-slate-700/60 rounded-2xl rounded-bl-none shadow-md flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-indigo-400" />
                <span className="text-xs font-semibold animate-pulse">Dewey AI reasoning...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Panel */}
      <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 shrink-0 space-y-1.5">
        <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
          <BrainCircuit size={11} />
          <span>Quick Assistant Prompts:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(s.text)}
              className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-indigo-950 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-800/60 transition-all font-semibold flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <span>{s.label}</span>
              <ArrowRight size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-1.5 relative bg-slate-800 rounded-xl border border-slate-700 p-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask ${meta.title.toLowerCase()}...`}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm px-2 focus:outline-none focus:border-0"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};

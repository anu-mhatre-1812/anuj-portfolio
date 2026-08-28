import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Message {
  role: 'user' | 'mini-gpt';
  text: string;
  file?: string;
}

const WELCOME: Message = {
  role: 'mini-gpt',
  text: "Hey! I'm Mini-GPT — your AI coding assistant built by Anuj Mhatre. Ask me anything about code, or upload a file for me to analyze.",
};

const ACCEPT = '.py,.js,.ts,.tsx,.jsx,.java,.c,.cpp,.h,.cs,.go,.rs,.rb,.php,.swift,.kt,.html,.css,.scss,.vue,.json,.yaml,.yml,.toml,.xml,.md,.txt,.sql,.sh,.csv,.ipynb,.log,.env,.cfg,.conf';

function parseMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    return `<div class="code-block"><div class="code-lang">${lang || 'code'}</div><pre><code>${code.trim()}</code></pre></div>`;
  });

  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/\n/g, '<br/>');

  return html;
}

export default function MiniGPT() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);

  const speechRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis ?? null;
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      speechRef.current = new SpeechRecognitionAPI();
      speechRef.current.continuous = false;
      speechRef.current.interimResults = false;
      speechRef.current.lang = 'en-US';
    }
  }, []);

  useEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      gsap.from('.minigpt-card', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFile(files[0]);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = () => setFile(null);

  const startVoice = () => {
    const recog = speechRef.current;
    if (!recog || loading) return;

    setListening(true);
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recog.start();
  };

  const stopVoice = () => {
    speechRef.current?.stop();
    setListening(false);
  };

  const speakText = (text: string, idx: number) => {
    const synth = synthRef.current;
    if (!synth) return;

    if (speaking === idx) {
      synth.cancel();
      setSpeaking(null);
      return;
    }

    synth.cancel();
    const clean = text.replace(/```[\s\S]*?```/g, 'code block').replace(/`[^`]+`/g, 'code').replace(/[*_#]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 0.95;
    utter.onend = () => setSpeaking(null);
    synth.speak(utter);
    setSpeaking(idx);
  };

  const send = async () => {
    const q = input.trim();
    if ((!q && !file) || loading) return;

    const userMsg: Message = { role: 'user', text: q || 'Analyze this file', file: file?.name };
    setMessages((m) => [...m, userMsg]);
    const prompt = q || 'Please analyze this file and explain what it does.';
    setInput('');
    setFile(null);
    setLoading(true);

    try {
      let res: Response;

      if (file) {
        const fileContent = await file.text();
        res = await fetch('/api/mini-gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            file: { name: file.name, content: fileContent, type: file.type },
          }),
        });
      } else {
        res = await fetch('/api/mini-gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
      }

      const d = await res.json();
      setMessages((m) => [...m, { role: 'mini-gpt', text: d.response ?? 'no response' }]);
    } catch {
      setMessages((m) => [...m, { role: 'mini-gpt', text: 'connection failed — try again' }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <div
      ref={rootRef}
      className={`minigpt-card card-base overflow-hidden p-0 shadow-[6px_6px_0_#8B5CF6] ${dragOver ? 'ring-2 ring-violet-400' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-2 border-b-[1.5px] border-ink/15 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-coral border border-ink/20" />
        <span className="h-3 w-3 rounded-full bg-yolk border border-ink/20" />
        <span className="h-3 w-3 rounded-full bg-saffron border border-ink/20" />
        <span className="ml-3 font-mono text-xs text-ink/50">mini-gpt ~ anuj@portfolio</span>
        <span className="ml-auto rounded-full border border-violet-400 bg-violet-400/20 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-violet-600">
          AI
        </span>
      </div>

      <div ref={scrollRef} className="h-80 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 font-mono text-[12.5px] leading-relaxed ${
                m.role === 'user'
                  ? 'bg-ink text-cream'
                  : 'border-[1.5px] border-ink/15 bg-cream text-ink'
              }`}
            >
              {m.role === 'mini-gpt' && (
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                    mini-gpt
                  </span>
                  <button
                    onClick={() => speakText(m.text, i)}
                    className="cursor-pointer text-[10px] text-ink/40 hover:text-violet-500"
                    title={speaking === i ? 'Stop speaking' : 'Read aloud'}
                  >
                    {speaking === i ? '■ stop' : '🔊 speak'}
                  </button>
                </div>
              )}
              {m.file && (
                <span className={`mb-1 block rounded px-2 py-0.5 text-[10px] ${
                  m.role === 'user' ? 'bg-cream/20 text-cream/80' : 'bg-violet-500/10 text-violet-600'
                }`}>
                  📎 {m.file}
                </span>
              )}
              {m.role === 'mini-gpt' ? (
                <div
                  className="prose-mini"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
                />
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg border-[1.5px] border-ink/15 bg-cream px-3.5 py-2.5 font-mono text-[12.5px]">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-violet-500">
                mini-gpt
              </span>
              <span className="inline-flex gap-1">
                <span className="animate-bounce [animation-delay:0ms]">·</span>
                <span className="animate-bounce [animation-delay:150ms]">·</span>
                <span className="animate-bounce [animation-delay:300ms]">·</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="flex items-center gap-2 border-t border-ink/10 bg-violet-500/5 px-4 py-2">
          <span className="truncate font-mono text-[11px] text-violet-600">📎 {file.name}</span>
          <button
            onClick={removeFile}
            className="ml-auto cursor-pointer font-mono text-[11px] text-coral hover:underline"
          >
            remove
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t-[1.5px] border-ink/15 px-4 py-3"
      >
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="cursor-hover shrink-0 rounded-btn border-[1.5px] border-ink/25 px-2 py-1.5 font-mono text-[11px] text-ink/60 transition-colors hover:border-violet-400 hover:text-violet-600"
          data-cursor-label="upload"
          title="Upload a file"
        >
          📎
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={listening ? stopVoice : startVoice}
          className={`cursor-hover shrink-0 rounded-btn border-[1.5px] px-2 py-1.5 font-mono text-[11px] transition-colors ${
            listening
              ? 'border-coral bg-coral/10 text-coral animate-pulse'
              : 'border-ink/25 text-ink/60 hover:border-saffron hover:text-saffron'
          }`}
          title={listening ? 'Stop listening' : 'Voice input'}
        >
          {listening ? '■' : '🎙'}
        </button>
        <span className="font-mono text-sm font-bold text-coral">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={listening ? 'listening...' : file ? `ask about ${file.name}…` : 'ask about code or upload a file…'}
          disabled={loading}
          className="w-full bg-transparent py-1.5 font-mono text-sm text-ink outline-none placeholder:text-ink/40 disabled:opacity-50"
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={loading || (!input.trim() && !file)}
          className="cursor-hover rounded-btn border-[1.5px] border-ink bg-ink px-3.5 py-1.5 font-mono text-xs text-cream transition-all hover:bg-cream hover:text-ink disabled:opacity-40"
          data-cursor-label="send"
        >
          {loading ? '…' : 'send'}
        </button>
      </form>
    </div>
  );
}

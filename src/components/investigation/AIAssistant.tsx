import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  PlayCircle,
  GitCompare,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import type { AIMessageItem } from '../../types/investigation';

interface AIAssistantProps {
  messages: AIMessageItem[];
  onSendMessage: (text: string) => void;
  onTriggerAction: (action: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  messages,
  onSendMessage,
  onTriggerAction,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const actionButtons = [
    { label: 'Run Simulation', action: 'run_simulation', icon: <PlayCircle size={11} /> },
    { label: 'Try Counterfactual Scenario', action: 'try_counterfactual', icon: <Sparkles size={11} /> },
    { label: 'Compare Scenarios', action: 'compare_scenarios', icon: <GitCompare size={11} /> },
    { label: 'Ask Custom Question', action: 'ask_question', icon: <HelpCircle size={11} /> },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(3, 10, 26, 0.9)',
      border: '1px solid rgba(0, 240, 255, 0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '340px',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        background: 'rgba(6, 18, 42, 0.7)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#00f0ff',
        }}>
          <Bot size={15} />
          <span>FORENSIC AI ASSISTANT</span>
        </div>

        <span style={{
          fontSize: '9px',
          fontFamily: 'var(--font-mono, monospace)',
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 6px',
          borderRadius: '3px',
        }}>
          SERVICE READY (OFFLINE DEMO)
        </span>
      </div>

      {/* Quick Action Chips Bar */}
      <div style={{
        padding: '8px 12px',
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        scrollbarWidth: 'none',
        background: 'rgba(2, 6, 18, 0.5)',
      }}>
        {actionButtons.map((btn) => (
          <button
            key={btn.action}
            onClick={() => onTriggerAction(btn.action)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(0, 240, 255, 0.06)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.15)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 240, 255, 0.06)';
              e.currentTarget.style.color = '#38bdf8';
            }}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Conversation Message Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const isSystem = msg.sender === 'system';

          if (isSystem) {
            return (
              <div
                key={msg.id}
                style={{
                  padding: '6px 10px',
                  borderRadius: '4px',
                  background: 'rgba(30, 64, 175, 0.15)',
                  border: '1px dashed rgba(59, 130, 246, 0.3)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '10px',
                  color: '#93c5fd',
                  lineHeight: 1.4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', color: '#60a5fa' }}>
                  <Cpu size={10} />
                  <span>SYSTEM TELEMETRY [{msg.timestamp}]</span>
                </div>
                {msg.content}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                maxWidth: '90%',
                padding: '8px 11px',
                borderRadius: '6px',
                background: isAssistant ? 'rgba(6, 18, 42, 0.85)' : 'rgba(0, 240, 255, 0.12)',
                border: isAssistant ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(0, 240, 255, 0.4)',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '3px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '9.5px',
                color: isAssistant ? '#00f0ff' : '#94a3b8',
              }}>
                <span>{isAssistant ? 'FORENSIC REASONER' : 'INVESTIGATOR'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <div style={{
                fontSize: '11.5px',
                color: '#e2e8f0',
                lineHeight: 1.4,
              }}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Box Area */}
      <div style={{
        padding: '8px 12px',
        background: 'rgba(6, 18, 42, 0.8)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <input
          type="text"
          placeholder="Inquire scene physics, trajectory anomalies, or correlations..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '5px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            color: '#ffffff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '11px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            padding: '7px 12px',
            borderRadius: '5px',
            background: inputText.trim() ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
            border: inputText.trim() ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
            color: inputText.trim() ? '#00f0ff' : '#64748b',
            cursor: inputText.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
};

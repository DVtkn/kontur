import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { CaseHint } from '../types';
import { sound } from '../audio/soundEngine';

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  hints: CaseHint;
  unlockedLevel: number;
  onUnlockLevel: (level: number) => void;
}

export const HintModal: React.FC<HintModalProps> = ({
  isOpen,
  onClose,
  caseTitle,
  hints,
  unlockedLevel,
  onUnlockLevel,
}) => {
  const [confirmLevel3, setConfirmLevel3] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRevealNext = (level: number) => {
    sound.playKeyClick();
    sound.triggerHaptic('tap');
    onUnlockLevel(level);
    setConfirmLevel3(false);
  };

  return (
    <div className="hint-modal-overlay" onClick={onClose}>
      <div className="hint-modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} color="var(--amber)" />
            <h3 style={{ fontSize: '15px', color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Служебные ориентиры // {caseTitle}
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Если следственная группа зашла в тупик, вы можете поэтапно запросить данные из контрольного журнала диспетчера.
        </p>

        {/* Уровень 1: Направление мысли */}
        <div className={`hint-tier-card ${unlockedLevel >= 1 ? 'unlocked' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: unlockedLevel >= 1 ? 'var(--amber)' : 'var(--text-muted)' }}>
              УРОВЕНЬ 1 // НАПРАВЛЕНИЕ МЫСЛИ
            </span>
            {unlockedLevel >= 1 ? (
              <CheckCircle size={14} color="var(--amber)" />
            ) : (
              <button
                onClick={() => handleRevealNext(1)}
                className="terminal-btn"
                style={{ fontSize: '10px', padding: '4px 8px', minHeight: '28px' }}
              >
                РАСКРЫТЬ
              </button>
            )}
          </div>
          {unlockedLevel >= 1 ? (
            <p style={{ fontSize: '13px', color: '#f0ede6', lineHeight: 1.5 }}>{hints.level1}</p>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Легкий намек на источник информации.
            </p>
          )}
        </div>

        {/* Уровень 2: Ключевая улика */}
        <div className={`hint-tier-card ${unlockedLevel >= 2 ? 'unlocked' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: unlockedLevel >= 2 ? 'var(--amber)' : 'var(--text-muted)' }}>
              УРОВЕНЬ 2 // КЛЮЧЕВАЯ УЛИКА
            </span>
            {unlockedLevel >= 2 ? (
              <CheckCircle size={14} color="var(--amber)" />
            ) : unlockedLevel >= 1 ? (
              <button
                onClick={() => handleRevealNext(2)}
                className="terminal-btn"
                style={{ fontSize: '10px', padding: '4px 8px', minHeight: '28px' }}
              >
                РАСКРЫТЬ
              </button>
            ) : (
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ЗАКРЫТО</span>
            )}
          </div>
          {unlockedLevel >= 2 ? (
            <p style={{ fontSize: '13px', color: '#f0ede6', lineHeight: 1.5 }}>{hints.level2}</p>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Конкретное сопоставление данных и точный алгоритм расчета.
            </p>
          )}
        </div>

        {/* Уровень 3: Прямое решение */}
        <div className={`hint-tier-card ${unlockedLevel >= 3 ? 'solution' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: unlockedLevel >= 3 ? 'var(--green-term)' : 'var(--text-muted)' }}>
              УРОВЕНЬ 3 // ПРЯМОЕ РЕШЕНИЕ
            </span>
            {unlockedLevel >= 3 ? (
              <CheckCircle size={14} color="var(--green-term)" />
            ) : unlockedLevel >= 2 ? (
              confirmLevel3 ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleRevealNext(3)}
                    className="terminal-btn"
                    style={{ fontSize: '10px', padding: '4px 8px', minHeight: '28px', borderColor: 'var(--red-alarm)', color: 'var(--red-alarm)' }}
                  >
                    ПОДТВЕРДИТЬ ОТВЕТ
                  </button>
                  <button
                    onClick={() => setConfirmLevel3(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer' }}
                  >
                    ОТМЕНА
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmLevel3(true)}
                  className="terminal-btn"
                  style={{ fontSize: '10px', padding: '4px 8px', minHeight: '28px' }}
                >
                  <Eye size={12} style={{ marginRight: '4px' }} />
                  ПОКАЗАТЬ ОТВЕТ
                </button>
              )
            ) : (
              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ЗАКРЫТО</span>
            )}
          </div>
          {unlockedLevel >= 3 ? (
            <div style={{ background: '#080a0d', padding: '10px 12px', borderLeft: '3px solid var(--green-term)' }}>
              <p style={{ fontSize: '13px', color: 'var(--green-term)', fontWeight: 700, lineHeight: 1.5 }}>
                {hints.level3}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
              Точный пароль, лицевой счет или команда для гарантированного прохождения.
            </p>
          )}
        </div>

        <div style={{ marginTop: '18px', textAlign: 'center' }}>
          <button
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="terminal-btn"
            style={{ width: '100%', minHeight: '44px', background: 'rgba(255, 180, 34, 0.1)' }}
          >
            ВЕРНУТЬСЯ К РАССЛЕДОВАНИЮ
          </button>
        </div>
      </div>
    </div>
  );
};

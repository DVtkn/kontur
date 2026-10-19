import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ShieldAlert, Radio, ArrowLeft, Monitor } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { ActiveScreen } from '../types';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  soundEnabled,
  onToggleSound,
  crtEnabled,
  onToggleCrt,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('ru-RU', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="terminal-card" style={{ marginBottom: '16px', borderRadius: '0' }}>
      <div className="terminal-header" style={{ padding: '10px 16px', background: '#0e1013' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Radio size={18} color="var(--amber)" className="pulse-alarm" style={{ animationDuration: '3s' }} />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)', letterSpacing: '1.2px', fontSize: '13px' }}>
              ГОРСВЕТТЕХКОНТРОЛЬ // СЛУЖЕБНЫЙ УЗЕЛ-70
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              СЕССИЯ: НЕШИФРОВАННЫЙ ПЕРЕХВАТ | ДЕЖУРНАЯ СМЕНА #4
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--red-alarm)', boxShadow: '0 0 8px var(--red-alarm)' }}></span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '1px' }}>
              {timeStr || '02:14:00'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {currentScreen !== 'hub' && (
              <button
                className="btn-control"
                onClick={() => {
                  sound.playClick();
                  onNavigate('hub');
                }}
                title="Вернуться к карте города"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                <ArrowLeft size={14} /> НА СХЕМУ ГОРОДА
              </button>
            )}

            <button
              className="btn-control"
              onClick={() => {
                sound.playClick();
                onToggleSound();
              }}
              title={soundEnabled ? 'Отключить звук' : 'Включить звук'}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              {soundEnabled ? <Volume2 size={14} color="var(--green-term)" /> : <VolumeX size={14} color="var(--text-dim)" />}
              <span>{soundEnabled ? 'ЗВУК: ВКЛ' : 'ЗВУК: ВЫКЛ'}</span>
            </button>

            <button
              className="btn-control"
              onClick={() => {
                sound.playClick();
                onToggleCrt();
              }}
              title="Переключить ЭЛТ-фильтр"
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              <Monitor size={14} color={crtEnabled ? 'var(--amber)' : 'var(--text-dim)'} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

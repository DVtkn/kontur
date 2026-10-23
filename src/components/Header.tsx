import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, ArrowLeft, Monitor, Shield, Video, Sliders } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { ActiveScreen } from '../types';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  photosensitiveMode: boolean;
  onTogglePhotosensitive: () => void;
  streamerMode: boolean;
  onToggleStreamer: () => void;
  masterVolume?: number;
  onChangeVolume?: (vol: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  soundEnabled,
  onToggleSound,
  crtEnabled,
  onToggleCrt,
  photosensitiveMode,
  onTogglePhotosensitive,
  streamerMode,
  onToggleStreamer,
  masterVolume = 0.8,
  onChangeVolume,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

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
    <header className="terminal-card" style={{ marginBottom: '14px', borderRadius: '0' }}>
      <div
        className="terminal-header"
        style={{
          padding: '8px 12px',
          background: '#0e1013',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Brand & Connection Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio
            size={18}
            color="var(--amber)"
            className={photosensitiveMode ? '' : 'pulse-alarm'}
            style={{ animationDuration: '3s', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 800, color: 'var(--amber)', letterSpacing: '1px', fontSize: '12px' }}>
              <span className="responsive-hide-mobile">ГОРСВЕТТЕХКОНТРОЛЬ // </span>СЛУЖЕБНЫЙ УЗЕЛ-70
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              СМЕНА #4 <span className="responsive-hide-mobile">| НЕШИФРОВАННЫЙ ПЕРЕХВАТ</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Time stamp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--red-alarm)',
                boxShadow: photosensitiveMode ? 'none' : '0 0 6px var(--red-alarm)',
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '1px' }}>
              {timeStr || '02:14:00'}
            </span>
          </div>

          {/* Return to Map Button (Visible when inside a case) */}
          {currentScreen !== 'hub' && (
            <button
              className="btn-control"
              onClick={() => {
                sound.playClick();
                sound.triggerHaptic('tap');
                onNavigate('hub');
              }}
              title="Вернуться к карте города"
              style={{ padding: '6px 10px', fontSize: '11px', minHeight: '36px' }}
            >
              <ArrowLeft size={14} />
              <span className="responsive-hide-mobile">НА СХЕМУ ГОРОДА</span>
              <span className="md:hidden" style={{ display: 'none' }}>КАРТА</span>
            </button>
          )}

          {/* Quick Sound Toggle */}
          <button
            className="btn-control"
            onClick={() => {
              sound.playClick();
              sound.triggerHaptic('tap');
              onToggleSound();
            }}
            title={soundEnabled ? 'Отключить звук' : 'Включить звук'}
            style={{ padding: '6px 8px', fontSize: '11px', minHeight: '36px' }}
          >
            {soundEnabled ? <Volume2 size={15} color="var(--green-term)" /> : <VolumeX size={15} color="var(--text-dim)" />}
          </button>

          {/* Quick Settings Drawer Toggle */}
          <button
            className="btn-control"
            onClick={() => {
              sound.playClick();
              sound.triggerHaptic('tap');
              setShowSettings((prev) => !prev);
            }}
            title="Параметры и доступность"
            style={{
              padding: '6px 8px',
              fontSize: '11px',
              minHeight: '36px',
              background: showSettings ? 'var(--bg-panel-hover)' : undefined,
              borderColor: showSettings ? 'var(--amber)' : undefined,
            }}
          >
            <Sliders size={15} color={streamerMode || photosensitiveMode ? 'var(--amber)' : 'var(--text-dim)'} />
          </button>
        </div>
      </div>

      {/* Settings Panel Popover */}
      {showSettings && (
        <div
          style={{
            background: '#0d0f12',
            borderTop: '1px solid var(--border-light)',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            flexWrap: 'wrap',
            fontSize: '12px',
          }}
        >
          {/* Master Volume Slider */}
          {onChangeVolume && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: 600 }}>
                ГРОМКОСТЬ: {Math.round(masterVolume * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangeVolume(val);
                }}
                style={{
                  width: '90px',
                  accentColor: 'var(--amber)',
                  cursor: 'pointer',
                }}
                title="Регулировка общей громкости звукового синтезатора"
              />
            </div>
          )}

          {/* Photosensitivity Toggle */}
          <button
            className="btn-control"
            onClick={() => {
              sound.playClick();
              onTogglePhotosensitive();
            }}
            title="Отключить резкие вспышки и мерцания"
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              color: photosensitiveMode ? 'var(--green-term)' : 'var(--text-muted)',
              borderColor: photosensitiveMode ? 'var(--green-term)' : undefined,
            }}
          >
            <Shield size={13} color={photosensitiveMode ? 'var(--green-term)' : 'var(--text-dim)'} />
            <span>СВЕТОЧУВСТВИТЕЛЬНОСТЬ: {photosensitiveMode ? 'БЕЗОПАСНЫЙ РЕЖИМ' : 'ПОЛНЫЙ ХОРРОР'}</span>
          </button>

          {/* Streamer Mode Toggle */}
          <button
            className="btn-control"
            onClick={() => {
              sound.playClick();
              onToggleStreamer();
            }}
            title="Скрыть реальные геоданные и таймзону на стриме"
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              color: streamerMode ? 'var(--green-term)' : 'var(--text-muted)',
              borderColor: streamerMode ? 'var(--green-term)' : undefined,
            }}
          >
            <Video size={13} color={streamerMode ? 'var(--green-term)' : 'var(--text-dim)'} />
            <span>РЕЖИМ СТРИМЕРА: {streamerMode ? 'АКТИВЕН (ДАННЫЕ СКРЫТЫ)' : 'ВЫКЛ'}</span>
          </button>
        </div>
      )}
    </header>
  );
};

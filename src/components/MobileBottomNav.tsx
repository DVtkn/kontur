import React from 'react';
import { Map, FileText, Share2, HelpCircle, KeyRound } from 'lucide-react';
import { ActiveScreen } from '../types';
import { sound } from '../audio/soundEngine';

interface MobileBottomNavProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenHints: () => void;
  onToggleEvidenceBoard?: () => void;
  hasActiveCase: boolean;
  unlockedHintsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenHints,
  onToggleEvidenceBoard,
  hasActiveCase,
  unlockedHintsCount = 0,
}) => {
  const handleTabClick = (action: () => void) => {
    sound.playKeyClick();
    sound.triggerHaptic('tap');
    action();
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Мобильная навигация квеста">
      {/* Кнопка: Карта / Хаб */}
      <button
        onClick={() => handleTabClick(() => onNavigate('hub'))}
        className={`mobile-nav-item ${currentScreen === 'hub' ? 'active' : ''}`}
      >
        <Map size={18} />
        <span>КАРТА</span>
      </button>

      {/* Кнопка: Текущее дело */}
      <button
        onClick={() => {
          if (currentScreen === 'hub') {
            handleTabClick(() => onNavigate('rls4'));
          } else {
            handleTabClick(() => {});
          }
        }}
        className={`mobile-nav-item ${currentScreen !== 'hub' && currentScreen !== 'secret' ? 'active' : ''}`}
      >
        <FileText size={18} />
        <span>ДЕЛО</span>
      </button>

      {/* Кнопка: Доска связей */}
      <button
        onClick={() => {
          handleTabClick(() => {
            if (currentScreen !== 'hub') {
              onNavigate('hub');
            }
            if (onToggleEvidenceBoard) {
              setTimeout(onToggleEvidenceBoard, 50);
            }
          });
        }}
        className="mobile-nav-item"
      >
        <Share2 size={18} />
        <span>СВЯЗИ</span>
      </button>

      {/* Кнопка: Подсказки (доступна, если открыто дело) */}
      <button
        onClick={() => handleTabClick(onOpenHints)}
        className="mobile-nav-item"
        style={{ position: 'relative' }}
      >
        <HelpCircle size={18} color={hasActiveCase ? 'var(--amber)' : undefined} />
        <span style={{ color: hasActiveCase ? 'var(--amber)' : undefined }}>ГИД</span>
        {unlockedHintsCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '12px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--amber)',
            }}
          />
        )}
      </button>

      {/* Кнопка: Шифратор Допуска */}
      <button
        onClick={() => {
          handleTabClick(() => {
            if (currentScreen !== 'hub') {
              onNavigate('hub');
            }
            setTimeout(() => {
              const el = document.getElementById('terminal-cipher-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          });
        }}
        className={`mobile-nav-item ${currentScreen === 'secret' ? 'active' : ''}`}
      >
        <KeyRound size={18} />
        <span>ШИФР</span>
      </button>
    </nav>
  );
};

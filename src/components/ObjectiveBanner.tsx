import React from 'react';
import { Target, HelpCircle, CheckCircle } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface ObjectiveBannerProps {
  step: string;
  title: string;
  isSolved?: boolean;
  onOpenHints: () => void;
  unlockedHintLevel?: number;
}

export const ObjectiveBanner: React.FC<ObjectiveBannerProps> = ({
  step,
  title,
  isSolved = false,
  onOpenHints,
  unlockedHintLevel = 0,
}) => {
  return (
    <div className="objective-banner" role="region" aria-label="Текущая цель расследования">
      <div className="objective-banner-text">
        <div className="objective-label">
          {isSolved ? (
            <CheckCircle size={13} color="var(--green-term)" />
          ) : (
            <Target size={13} color="var(--amber)" />
          )}
          <span>{step}</span>
          {isSolved && (
            <span style={{ color: 'var(--green-term)', marginLeft: '6px' }}>[КУПИРОВАНО]</span>
          )}
        </div>
        <div className="objective-desc">
          {title}
        </div>
      </div>

      <button
        type="button"
        className="hint-trigger-btn"
        onClick={() => {
          sound.playKeyClick();
          sound.triggerHaptic('tap');
          onOpenHints();
        }}
        title="Открыть служебные подсказки и ориентиры"
      >
        <HelpCircle size={15} />
        <span>ПОДСКАЗКА</span>
        {unlockedHintLevel > 0 && (
          <span
            style={{
              background: 'var(--amber)',
              color: '#08090b',
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: '8px',
              fontWeight: 800,
            }}
          >
            {unlockedHintLevel}/3
          </span>
        )}
      </button>
    </div>
  );
};

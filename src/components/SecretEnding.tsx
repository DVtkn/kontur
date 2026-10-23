import React from 'react';
import { SecretFinale } from './SecretFinale';

interface SecretEndingProps {
  onReset?: () => void;
  onRestart?: () => void;
  onBack?: () => void;
  streamerMode?: boolean;
  photosensitiveMode?: boolean;
}

export const SecretEnding: React.FC<SecretEndingProps> = ({
  onReset,
  onRestart,
  onBack,
  streamerMode = false,
  photosensitiveMode = false,
}) => {
  const handleRestart = onRestart || onReset || (() => {});
  return (
    <SecretFinale
      onRestart={handleRestart}
      onBack={onBack}
      streamerMode={streamerMode}
      photosensitiveMode={photosensitiveMode}
    />
  );
};


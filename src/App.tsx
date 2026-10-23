import React, { useState, useEffect } from 'react';
import { ActiveScreen, GameProgress } from './types';
import { Header } from './components/Header';
import { Hub } from './components/Hub';
import { MapRLS4 } from './components/MapRLS4';
import { MapFloor4 } from './components/MapFloor4';
import { MapRoute0 } from './components/MapRoute0';
import { MapApt44 } from './components/MapApt44';
import { SecretFinale } from './components/SecretFinale';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HintModal } from './components/HintModal';
import { CASE_HINTS } from './data/hints';
import { sound } from './audio/soundEngine';

const STORAGE_KEY = 'kontur_game_progress_v1';

const defaultProgress: GameProgress = {
  rls4Solved: false,
  floor4Solved: false,
  route0Solved: false,
  apt44Solved: false,
  codes: {
    rls4: '19',
    floor4: '98',
    route0: '04',
    apt44: '44',
  },
  terminalInput: ['', '', '', ''],
  secretUnlocked: false,
  soundEnabled: true,
  photosensitiveMode: false,
  streamerMode: false,
  masterVolume: 0.8,
  discoveredEasterEggs: [],
};

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('hub');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);

  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultProgress, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return defaultProgress;
  });

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // Sync sound engine with soundEnabled
  useEffect(() => {
    sound.setMuted(!progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Sync volume with sound engine
  useEffect(() => {
    sound.setVolume(progress.masterVolume ?? 0.8);
  }, [progress.masterVolume]);

  const handleChangeVolume = (vol: number) => {
    setProgress((prev) => ({
      ...prev,
      masterVolume: vol,
    }));
  };

  const handleToggleSound = () => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleToggleCrt = () => {
    setCrtEnabled((prev) => !prev);
  };

  const handleTogglePhotosensitive = () => {
    setProgress((prev) => ({
      ...prev,
      photosensitiveMode: !prev.photosensitiveMode,
    }));
  };

  const handleToggleStreamer = () => {
    setProgress((prev) => ({
      ...prev,
      streamerMode: !prev.streamerMode,
    }));
  };

  const handleNavigate = (screen: ActiveScreen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMapComplete = (mapId: 'rls4' | 'floor4' | 'route0' | 'apt44', code: string) => {
    setProgress((prev) => {
      const slotIndex = mapId === 'rls4' ? 0 : mapId === 'floor4' ? 1 : mapId === 'route0' ? 2 : 3;
      const newTerminal = [...prev.terminalInput] as [string, string, string, string];
      newTerminal[slotIndex] = code;

      return {
        ...prev,
        [`${mapId}Solved`]: true,
        terminalInput: newTerminal,
      };
    });
  };

  const handleTerminalSlotChange = (index: number, val: string) => {
    setProgress((prev) => {
      const nextInput = [...prev.terminalInput] as [string, string, string, string];
      nextInput[index] = val;
      return {
        ...prev,
        terminalInput: nextInput,
      };
    });
  };

  const handleUnlockSecret = () => {
    setProgress((prev) => ({ ...prev, secretUnlocked: true }));
    setCurrentScreen('secret');
  };

  const handleResetGame = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setProgress(defaultProgress);
    setCurrentScreen('hub');
  };

  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);

  const activeCaseKey = currentScreen === 'rls4' || currentScreen === 'floor4' || currentScreen === 'route0' || currentScreen === 'apt44'
    ? currentScreen
    : 'hub';

  const caseTitles: Record<string, string> = {
    hub: 'Диспетчерский Узел // Карта секторов',
    rls4: 'Том I // Дело № 14-В (РЛС-4)',
    floor4: 'Том II // Дело № 29-Л (Лесная, 3)',
    route0: 'Том III // Дело № 03-Д (ТТУ, Вагон 314)',
    apt44: 'Том IV // Дело № 44-К (Квартира 44а)',
  };

  const handleOpenHints = () => {
    setIsHintModalOpen(true);
  };

  const handleUnlockHintLevel = (level: number) => {
    setProgress((prev) => ({
      ...prev,
      unlockedHints: {
        ...(prev.unlockedHints || {}),
        [activeCaseKey]: Math.max(prev.unlockedHints?.[activeCaseKey] || 0, level),
      },
    }));
  };

  const currentUnlockedLevel = progress.unlockedHints?.[activeCaseKey] || 0;

  return (
    <div
      className={`app-container ${progress.photosensitiveMode ? 'photosensitive-safe' : ''}`}
      style={{ minHeight: '100vh', position: 'relative' }}
    >
      {/* Optional CRT scanline & vignette layers */}
      {crtEnabled && (
        <>
          <div className="crt-overlay" />
          <div className="crt-vignette" />
        </>
      )}

      {/* Persistent Navigation Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        crtEnabled={crtEnabled}
        onToggleCrt={handleToggleCrt}
        photosensitiveMode={progress.photosensitiveMode}
        onTogglePhotosensitive={handleTogglePhotosensitive}
        streamerMode={progress.streamerMode}
        onToggleStreamer={handleToggleStreamer}
        masterVolume={progress.masterVolume ?? 0.8}
        onChangeVolume={handleChangeVolume}
      />

      {/* Screen Router */}
      <main>
        {currentScreen === 'hub' && (
          <Hub
            progress={progress}
            onNavigate={handleNavigate}
            onUpdateTerminalInput={handleTerminalSlotChange}
            onUnlockSecret={handleUnlockSecret}
          />
        )}

        {currentScreen === 'rls4' && (
          <MapRLS4
            alreadySolved={progress.rls4Solved}
            onBack={() => handleNavigate('hub')}
            onComplete={(code) => handleMapComplete('rls4', code)}
          />
        )}

        {currentScreen === 'floor4' && (
          <MapFloor4
            alreadySolved={progress.floor4Solved}
            onBack={() => handleNavigate('hub')}
            onComplete={(code) => handleMapComplete('floor4', code)}
          />
        )}

        {currentScreen === 'route0' && (
          <MapRoute0
            alreadySolved={progress.route0Solved}
            onBack={() => handleNavigate('hub')}
            onComplete={(code) => handleMapComplete('route0', code)}
          />
        )}

        {currentScreen === 'apt44' && (
          <MapApt44
            alreadySolved={progress.apt44Solved}
            onBack={() => handleNavigate('hub')}
            onComplete={(code) => handleMapComplete('apt44', code)}
          />
        )}

        {currentScreen === 'secret' && (
          <SecretFinale
            onRestart={handleResetGame}
            onBack={() => handleNavigate('hub')}
            streamerMode={progress.streamerMode}
            photosensitiveMode={progress.photosensitiveMode}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Citycode Quest UX) */}
      <MobileBottomNav
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onOpenHints={handleOpenHints}
        hasActiveCase={currentScreen !== 'hub' && currentScreen !== 'secret'}
        unlockedHintsCount={currentUnlockedLevel}
      />

      {/* Progressive Multi-Tier Hint Modal */}
      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        caseTitle={caseTitles[activeCaseKey] || 'Дело'}
        hints={CASE_HINTS[activeCaseKey] || CASE_HINTS.hub}
        unlockedLevel={currentUnlockedLevel}
        onUnlockLevel={handleUnlockHintLevel}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ActiveScreen, GameProgress } from './types';
import { sound } from './audio/soundEngine';
import { Header } from './components/Header';
import { Hub } from './components/Hub';
import { MapRLS4 } from './components/MapRLS4';
import { MapFloor4 } from './components/MapFloor4';
import { MapRoute0 } from './components/MapRoute0';
import { MapApt44 } from './components/MapApt44';
import { SecretFinale } from './components/SecretFinale';

const STORAGE_KEY = 'kontur_game_state_v1';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('hub');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
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
    };
  });

  // Save progress
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  // Audio start on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      sound.playClick(800);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Map completions
  const handleCompleteRLS4 = (code: string) => {
    setProgress((prev) => {
      const newInputs = [...prev.terminalInput] as [string, string, string, string];
      newInputs[0] = code;
      return {
        ...prev,
        rls4Solved: true,
        terminalInput: newInputs,
      };
    });
  };

  const handleCompleteFloor4 = (code: string) => {
    setProgress((prev) => {
      const newInputs = [...prev.terminalInput] as [string, string, string, string];
      newInputs[1] = code;
      return {
        ...prev,
        floor4Solved: true,
        terminalInput: newInputs,
      };
    });
  };

  const handleCompleteRoute0 = (code: string) => {
    setProgress((prev) => {
      const newInputs = [...prev.terminalInput] as [string, string, string, string];
      newInputs[2] = code;
      return {
        ...prev,
        route0Solved: true,
        terminalInput: newInputs,
      };
    });
  };

  const handleCompleteApt44 = (code: string) => {
    setProgress((prev) => {
      const newInputs = [...prev.terminalInput] as [string, string, string, string];
      newInputs[3] = code;
      return {
        ...prev,
        apt44Solved: true,
        terminalInput: newInputs,
      };
    });
  };

  const handleUpdateTerminalInput = (index: number, val: string) => {
    setProgress((prev) => {
      const newInputs = [...prev.terminalInput] as [string, string, string, string];
      newInputs[index] = val;
      return {
        ...prev,
        terminalInput: newInputs,
      };
    });
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sound.setMuted(!nextVal);
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress({
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
    });
    setCurrentScreen('hub');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', paddingBottom: '40px' }}>
      {/* CRT Overlay Effects */}
      {crtEnabled && (
        <>
          <div className="crt-overlay" />
          <div className="crt-vignette" />
        </>
      )}

      {/* Main Header */}
      {currentScreen !== 'secret' && (
        <Header
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        />
      )}

      {/* Screen Routing */}
      {currentScreen === 'hub' && (
        <Hub
          progress={progress}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onUpdateTerminalInput={handleUpdateTerminalInput}
          onUnlockSecret={() => setCurrentScreen('secret')}
        />
      )}

      {currentScreen === 'rls4' && (
        <MapRLS4
          alreadySolved={progress.rls4Solved}
          onComplete={(code) => handleCompleteRLS4(code)}
          onBack={() => setCurrentScreen('hub')}
        />
      )}

      {currentScreen === 'floor4' && (
        <MapFloor4
          alreadySolved={progress.floor4Solved}
          onComplete={(code) => handleCompleteFloor4(code)}
          onBack={() => setCurrentScreen('hub')}
        />
      )}

      {currentScreen === 'route0' && (
        <MapRoute0
          alreadySolved={progress.route0Solved}
          onComplete={(code) => handleCompleteRoute0(code)}
          onBack={() => setCurrentScreen('hub')}
        />
      )}

      {currentScreen === 'apt44' && (
        <MapApt44
          alreadySolved={progress.apt44Solved}
          onComplete={(code) => handleCompleteApt44(code)}
          onBack={() => setCurrentScreen('hub')}
        />
      )}

      {currentScreen === 'secret' && (
        <SecretFinale onRestart={handleRestart} />
      )}
    </div>
  );
};

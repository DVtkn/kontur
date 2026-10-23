export type ActiveScreen = 'hub' | 'rls4' | 'floor4' | 'route0' | 'apt44' | 'secret';

export interface GameProgress {
  rls4Solved: boolean;
  floor4Solved: boolean;
  route0Solved: boolean;
  apt44Solved: boolean;
  codes: {
    rls4: string;
    floor4: string;
    route0: string;
    apt44: string;
  };
  terminalInput: [string, string, string, string];
  secretUnlocked: boolean;
  soundEnabled: boolean;
  photosensitiveMode: boolean;
  streamerMode: boolean;
  masterVolume?: number;
  discoveredEasterEggs?: string[];
  unlockedHints?: Record<string, number>;
}

export interface DispatchLog {
  id: string;
  time: string;
  sector: string;
  level: 'info' | 'warn' | 'crit';
  message: string;
}

export interface MapIncident {
  id: ActiveScreen;
  codeName: string;
  sectorName: string;
  coordinates: { x: number; y: number };
  shortDesc: string;
  atmosphere: string;
  codeFound: string;
}

export type HintLevel = 1 | 2 | 3;

export interface CaseHint {
  level1: string; // Направление мысли (легкий намек)
  level2: string; // Ключевая улика (куда смотреть)
  level3: string; // Прямой ответ (полное решение)
}

export type MobileNavTab = 'hub' | 'case' | 'clues' | 'hints' | 'terminal';

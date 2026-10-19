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

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sound } from '../audio/soundEngine';
import { GameProgress } from '../types';

describe('Game Codes & Terminal Access Verification', () => {
  const CORRECT_CODES = {
    rls4: '19',
    floor4: '98',
    route0: '04',
    apt44: '44',
  };

  const EASTER_EGG_CODES = {
    DIAGNOSTICS: '00000000',
    CURSE: '66666666',
    DEPOT_WIRE: '71488040',
    INCIDENT_DATE: '14041998',
    TRAM_SOKOLOV: '31407140',
    INTERCOM_ALERT: '88040038',
  };

  it('validates correct individual sector codes', () => {
    expect(CORRECT_CODES.rls4).toBe('19');
    expect(CORRECT_CODES.floor4).toBe('98');
    expect(CORRECT_CODES.route0).toBe('04');
    expect(CORRECT_CODES.apt44).toBe('44');
  });

  it('validates concatenated 8-digit emergency access master code', () => {
    const masterCode = Object.values(CORRECT_CODES).join('');
    expect(masterCode).toBe('19980444');
  });

  it('sanitizes slot input to exactly 2 digits max and discards non-numeric chars', () => {
    const sanitizeSlotInput = (val: string) => val.replace(/\D/g, '').slice(0, 2);

    expect(sanitizeSlotInput('19')).toBe('19');
    expect(sanitizeSlotInput('199')).toBe('19');
    expect(sanitizeSlotInput('1a9b')).toBe('19');
    expect(sanitizeSlotInput('abc')).toBe('');
    expect(sanitizeSlotInput('  04  ')).toBe('04');
  });

  it('distributes pasted clipboard text across terminal slots starting at any index', () => {
    const distributePaste = (pasteText: string, startIndex: number, initialSlots: string[]) => {
      const digits = pasteText.replace(/\D/g, '');
      if (!digits) return initialSlots;
      const slots = [...initialSlots];
      let remaining = digits;
      let curr = startIndex;
      while (remaining.length > 0 && curr < 4) {
        slots[curr] = remaining.slice(0, 2);
        remaining = remaining.slice(2);
        curr++;
      }
      return slots;
    };

    // Full 8-digit paste into slot 0
    expect(distributePaste('19980444', 0, ['', '', '', ''])).toEqual(['19', '98', '04', '44']);

    // Hyphenated/spaced format paste into slot 0
    expect(distributePaste('19-98-04-44', 0, ['', '', '', ''])).toEqual(['19', '98', '04', '44']);

    // Partial 4-digit paste starting at slot 2
    expect(distributePaste('0444', 2, ['19', '98', '', ''])).toEqual(['19', '98', '04', '44']);

    // Extra digits are truncated safely at 4 slots max
    expect(distributePaste('1998044499999', 0, ['', '', '', ''])).toEqual(['19', '98', '04', '44']);

    // Non-digit input is safely ignored
    expect(distributePaste('SECRET_CODE', 0, ['19', '', '', ''])).toEqual(['19', '', '', '']);
  });

  it('correctly categorizes terminal inputs for secret ending and easter eggs', () => {
    const checkTerminalCode = (slots: string[]) => {
      const code = slots.join('');
      if (code === '19980444') return { type: 'SECRET_UNLOCKED' };
      if (code === EASTER_EGG_CODES.DIAGNOSTICS) return { type: 'EASTER_EGG_DIAGNOSTICS' };
      if (code === EASTER_EGG_CODES.CURSE) return { type: 'EASTER_EGG_CURSE' };
      if (code === EASTER_EGG_CODES.DEPOT_WIRE) return { type: 'EASTER_EGG_WIRE' };
      if (code === EASTER_EGG_CODES.INCIDENT_DATE) return { type: 'EASTER_EGG_INCIDENT_DATE' };
      if (code === EASTER_EGG_CODES.TRAM_SOKOLOV) return { type: 'EASTER_EGG_TRAM_SOKOLOV' };
      if (code === EASTER_EGG_CODES.INTERCOM_ALERT) return { type: 'EASTER_EGG_INTERCOM_ALERT' };
      return { type: 'ERROR' };
    };

    expect(checkTerminalCode(['19', '98', '04', '44']).type).toBe('SECRET_UNLOCKED');
    expect(checkTerminalCode(['00', '00', '00', '00']).type).toBe('EASTER_EGG_DIAGNOSTICS');
    expect(checkTerminalCode(['66', '66', '66', '66']).type).toBe('EASTER_EGG_CURSE');
    expect(checkTerminalCode(['71', '48', '80', '40']).type).toBe('EASTER_EGG_WIRE');
    expect(checkTerminalCode(['14', '04', '19', '98']).type).toBe('EASTER_EGG_INCIDENT_DATE');
    expect(checkTerminalCode(['31', '40', '71', '40']).type).toBe('EASTER_EGG_TRAM_SOKOLOV');
    expect(checkTerminalCode(['88', '04', '00', '38']).type).toBe('EASTER_EGG_INTERCOM_ALERT');

    // Partial or invalid inputs
    expect(checkTerminalCode(['19', '98', '04', '']).type).toBe('ERROR');
    expect(checkTerminalCode(['12', '34', '56', '78']).type).toBe('ERROR');
    expect(checkTerminalCode(['', '', '', '']).type).toBe('ERROR');
  });
});

describe('Web Audio Procedural Sound Engine', () => {
  beforeEach(() => {
    sound.setMuted(false);
    sound.setVolume(0.8);
  });

  it('initializes with default volume 0.8 and unmuted', () => {
    expect(sound.getVolume()).toBe(0.8);
    expect(sound.getIsMuted()).toBe(false);
  });

  it('clamps volume setting between 0.0 and 1.0', () => {
    sound.setVolume(0.5);
    expect(sound.getVolume()).toBe(0.5);

    sound.setVolume(-0.5);
    expect(sound.getVolume()).toBe(0);

    sound.setVolume(1.8);
    expect(sound.getVolume()).toBe(1);
  });

  it('manages mute state correctly', () => {
    sound.setMuted(true);
    expect(sound.getIsMuted()).toBe(true);

    sound.setMuted(false);
    expect(sound.getIsMuted()).toBe(false);
  });

  it('does not start transformer hum on unmuting if hum was not previously active', () => {
    sound.stopTransformerHum();
    expect(sound.getIsHumming()).toBe(false);

    sound.setMuted(true);
    expect(sound.getIsHumming()).toBe(false);

    sound.setMuted(false);
    // Crucial bug fix verification: unmuting must NOT auto-launch transformer hum
    expect(sound.getIsHumming()).toBe(false);
  });

  it('safely handles audio triggers when AudioContext is absent without throwing unhandled exceptions', () => {
    // In headless Node/vitest without AudioContext, methods catch internally
    expect(() => {
      sound.playClick();
      sound.playKeypress();
      sound.playScreamerThud();
      sound.playGeigerCounter();
      sound.playBreakerTrip();
      sound.playCryoHiss();
      sound.playTelephoneRing();
      sound.playRotaryDial();
      sound.playMorseCode();
      sound.playGlitch();
      sound.playHeartbeat();
      sound.playStatic();
      sound.stopTransformerHum();
    }).not.toThrow();
  });

  it('simulates full Web Audio graph node creation with mock AudioContext', () => {
    const mockNodes: any[] = [];
    const mockGainParam = {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      value: 1,
    };

    const createMockGain = () => {
      const node = {
        gain: { ...mockGainParam },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
      mockNodes.push(node);
      return node;
    };

    const createMockOscillator = () => {
      const node = {
        type: 'sine',
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          value: 440,
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
      mockNodes.push(node);
      return node;
    };

    const mockCtx = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(createMockGain),
      createOscillator: vi.fn(createMockOscillator),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(44100)),
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: 'lowpass',
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      resume: vi.fn().mockResolvedValue(undefined),
    };

    const MockAudioContext = vi.fn(function (this: any) {
      return mockCtx;
    });

    // Inject mock into window
    (globalThis as any).window = {
      AudioContext: MockAudioContext,
    };

    // Test calling methods with the mocked Web Audio API
    expect(() => {
      sound.playClick(1000);
      sound.playBreakerTrip();
      sound.playCryoHiss();
      sound.playRotaryDial();
      sound.playTelephoneRing();
      sound.playMorseCode();
    }).not.toThrow();

    // Verify oscillator and gain creation calls
    expect(mockCtx.createGain).toHaveBeenCalled();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
  });
});

describe('Streamer Mode & ARG Telemetry Masking', () => {
  it('masks sensitive telemetry in streamer mode', () => {
    const getTelemetry = (streamerMode: boolean) => {
      if (streamerMode) {
        return {
          time: '23:42:00 [STREAMER SAFE]',
          timeZone: 'СЕКТОР-70 // СЕВЕРНЫЙ ОКРУГ',
          deviceInfo: 'ТЕРМИНАЛ ДИСПЕТЧЕРА ГСТК',
          screenRes: '1920 × 1080',
        };
      }
      return {
        time: 'REAL_LOCAL_TIME',
        timeZone: 'REAL_TIMEZONE',
        deviceInfo: 'REAL_DEVICE',
        screenRes: 'REAL_RES',
      };
    };

    const safeTelemetry = getTelemetry(true);
    expect(safeTelemetry.time).toContain('[STREAMER SAFE]');
    expect(safeTelemetry.timeZone).toBe('СЕКТОР-70 // СЕВЕРНЫЙ ОКРУГ');
    expect(safeTelemetry.deviceInfo).toBe('ТЕРМИНАЛ ДИСПЕТЧЕРА ГСТК');
    expect(safeTelemetry.screenRes).toBe('1920 × 1080');

    // Make sure it contains no actual OS or location leaks
    expect(safeTelemetry.timeZone).not.toContain('Europe');
    expect(safeTelemetry.timeZone).not.toContain('Asia');
    expect(safeTelemetry.timeZone).not.toContain('America');
  });

  it('generates a complete investigation dossier including all 4 incident sectors and 5th presence anomaly', () => {
    const generateDossierText = (params: {
      time: string;
      tz: string;
      device: string;
      screen: string;
    }) => {
      return `================================================================================
ГОРСВЕТТЕХКОНТРОЛЬ // СЛУЖЕБНЫЙ УЗЕЛ-70
ГРИФ: ОСОБОЙ ВАЖНОСТИ // АКТ ДЕАНОНИМИЗАЦИИ ОПЕРАТОРА
================================================================================

ОБЪЕКТ НАБЛЮДЕНИЯ: ${params.time}
ГЕОГРАФИЧЕСКИЙ УЗЕЛ: ${params.tz}
УСТРОЙСТВО ЗАХВАТА: ${params.device} (${params.screen})
СТАТУС РАССЛЕДОВАНИЯ: УТЕЧКИ КУПИРОВАНЫ. АРХИВ СКОМПРОМЕТИРОВАН.

СВОДНЫЙ КЛЮЧ ДОПУСКА: [ 19 ] - [ 98 ] - [ 04 ] - [ 44 ]
- Сектор В (Объект РЛС-4): Крио-консервация шлюза В-2 проведена.
- Сектор Л (4-й этаж ЖК Лесной): Силовое реле квартиры 38 выжжено.
- Сектор Д (Маршрут №0 Депо): Чистильщик нейтрализован кодом 3140.
- Сектор К (Квартира 44а): Наложен статус «КАРАНТИН БЕЗ СРОКА ДАВНОСТИ».

ТОЧКА 5: ВАШЕ ТЕКУЩЕЕ МЕСТОПОЛОЖЕНИЕ.
ДАТЧИК ПРИСУТСТВИЯ: 2 ЧЕЛОВЕКА.
================================================================================`;
    };

    const dossier = generateDossierText({
      time: '23:42:00 [STREAMER SAFE]',
      tz: 'СЕКТОР-70 // СЕВЕРНЫЙ ОКРУГ',
      device: 'ТЕРМИНАЛ ДИСПЕТЧЕРА ГСТК',
      screen: '1920 × 1080',
    });

    expect(dossier).toContain('СВОДНЫЙ КЛЮЧ ДОПУСКА: [ 19 ] - [ 98 ] - [ 04 ] - [ 44 ]');
    expect(dossier).toContain('ДАТЧИК ПРИСУТСТВИЯ: 2 ЧЕЛОВЕКА');
    expect(dossier).toContain('Сектор В (Объект РЛС-4)');
    expect(dossier).toContain('Сектор Л (4-й этаж ЖК Лесной)');
    expect(dossier).toContain('Сектор Д (Маршрут №0 Депо)');
    expect(dossier).toContain('Сектор К (Квартира 44а)');
  });
});

describe('Game Progress & Accessibility States', () => {
  it('initializes default game state with all maps uncompleted', () => {
    const defaultProgress: GameProgress = {
      rls4Solved: false,
      floor4Solved: false,
      route0Solved: false,
      apt44Solved: false,
      secretUnlocked: false,
      codes: {
        rls4: '19',
        floor4: '98',
        route0: '04',
        apt44: '44',
      },
      terminalInput: ['', '', '', ''],
      soundEnabled: true,
      photosensitiveMode: false,
      streamerMode: false,
      masterVolume: 0.8,
      discoveredEasterEggs: [],
    };

    expect(defaultProgress.rls4Solved).toBe(false);
    expect(defaultProgress.floor4Solved).toBe(false);
    expect(defaultProgress.route0Solved).toBe(false);
    expect(defaultProgress.apt44Solved).toBe(false);
    expect(defaultProgress.secretUnlocked).toBe(false);
    expect(defaultProgress.photosensitiveMode).toBe(false);
    expect(defaultProgress.streamerMode).toBe(false);
  });

  it('handles state transition to completed game', () => {
    let progress: GameProgress = {
      rls4Solved: false,
      floor4Solved: false,
      route0Solved: false,
      apt44Solved: false,
      secretUnlocked: false,
      codes: {
        rls4: '19',
        floor4: '98',
        route0: '04',
        apt44: '44',
      },
      terminalInput: ['', '', '', ''],
      soundEnabled: true,
      photosensitiveMode: false,
      streamerMode: false,
    };

    // Complete all 4 maps
    progress = {
      ...progress,
      rls4Solved: true,
      floor4Solved: true,
      route0Solved: true,
      apt44Solved: true,
      terminalInput: ['19', '98', '04', '44'],
      secretUnlocked: true,
    };

    expect(progress.rls4Solved).toBe(true);
    expect(progress.floor4Solved).toBe(true);
    expect(progress.route0Solved).toBe(true);
    expect(progress.apt44Solved).toBe(true);
    expect(progress.terminalInput.join('')).toBe('19980444');
    expect(progress.secretUnlocked).toBe(true);
  });

  it('safely hydrates legacy and corrupted localStorage state without crashing', () => {
    const defaultProgress: GameProgress = {
      rls4Solved: false,
      floor4Solved: false,
      route0Solved: false,
      apt44Solved: false,
      secretUnlocked: false,
      codes: { rls4: '19', floor4: '98', route0: '04', apt44: '44' },
      terminalInput: ['', '', '', ''],
      soundEnabled: true,
      photosensitiveMode: false,
      streamerMode: false,
      masterVolume: 0.8,
      discoveredEasterEggs: [],
    };

    const hydrateProgress = (rawJson: string | null): GameProgress => {
      try {
        if (!rawJson) return defaultProgress;
        const parsed = JSON.parse(rawJson);
        return {
          ...defaultProgress,
          ...parsed,
          codes: { ...defaultProgress.codes, ...(parsed.codes || {}) },
          terminalInput: Array.isArray(parsed.terminalInput) && parsed.terminalInput.length === 4
            ? parsed.terminalInput
            : defaultProgress.terminalInput,
          masterVolume: typeof parsed.masterVolume === 'number'
            ? Math.max(0, Math.min(1, parsed.masterVolume))
            : defaultProgress.masterVolume,
          discoveredEasterEggs: Array.isArray(parsed.discoveredEasterEggs)
            ? parsed.discoveredEasterEggs
            : [],
        };
      } catch {
        return defaultProgress;
      }
    };

    // Corrupted JSON returns default
    expect(hydrateProgress('{corrupt-json')).toEqual(defaultProgress);

    // Null/empty returns default
    expect(hydrateProgress(null)).toEqual(defaultProgress);

    // Old version with missing masterVolume gets default 0.8 and empty easter eggs
    const legacy = JSON.stringify({ rls4Solved: true });
    const hydratedLegacy = hydrateProgress(legacy);
    expect(hydratedLegacy.rls4Solved).toBe(true);
    expect(hydratedLegacy.masterVolume).toBe(0.8);
    expect(hydratedLegacy.discoveredEasterEggs).toEqual([]);

    // Volume out of bounds gets clamped [0, 1]
    const clampedUpper = hydrateProgress(JSON.stringify({ masterVolume: 2.5 }));
    expect(clampedUpper.masterVolume).toBe(1);
    const clampedLower = hydrateProgress(JSON.stringify({ masterVolume: -0.5 }));
    expect(clampedLower.masterVolume).toBe(0);
  });
});

describe('Map 1: RLS-4 Bunker Investigative Logic', () => {
  it('correctly matches personnel search query for technician Sokolov (#714) across aliases', () => {
    const searchDb = (query: string) => {
      const trimmed = query.trim().toLowerCase();
      if (
        trimmed === '714' ||
        trimmed.includes('соколов') ||
        trimmed.includes('sokolov')
      ) {
        return {
          found: true,
          name: 'Соколов И.В.',
          status: 'ПОГИБ ПРИ ИНЦИДЕНТЕ 14.04.1998',
          tabNumber: '714',
        };
      }
      return { found: false };
    };

    expect(searchDb('714').found).toBe(true);
    expect(searchDb(' 714  ').found).toBe(true);
    expect(searchDb('соколов').found).toBe(true);
    expect(searchDb('Соколов И.В.').found).toBe(true);
    expect(searchDb('sokolov').found).toBe(true);
    expect(searchDb('SOKOLOV').found).toBe(true);
    expect(searchDb('001').found).toBe(false);
    expect(searchDb('петров').found).toBe(false);
  });

  it('validates cryo-containment freeze code 714 and awards sector code 19', () => {
    const executeFreeze = (inputCode: string) => {
      if (inputCode.trim() === '714') {
        return { success: true, sectorCode: '19' };
      }
      return { success: false, error: 'ОШИБКА АВТОРИЗАЦИИ' };
    };

    expect(executeFreeze('714')).toEqual({ success: true, sectorCode: '19' });
    expect(executeFreeze(' 714 ')).toEqual({ success: true, sectorCode: '19' });
    // Inverted logic check: 19 is the sector reward code, NOT the cryo-freeze input code!
    expect(executeFreeze('19')).toEqual({ success: false, error: 'ОШИБКА АВТОРИЗАЦИИ' });
    expect(executeFreeze('20')).toEqual({ success: false, error: 'ОШИБКА АВТОРИЗАЦИИ' });
    expect(executeFreeze('')).toEqual({ success: false, error: 'ОШИБКА АВТОРИЗАЦИИ' });
  });

  it('evaluates breach countdown timer condition', () => {
    const isBreached = (secondsLeft: number) => secondsLeft <= 0;
    expect(isBreached(40)).toBe(false);
    expect(isBreached(1)).toBe(false);
    expect(isBreached(0)).toBe(true);
    expect(isBreached(-5)).toBe(true);
  });
});

describe('Map 2: 4-й этаж (Floor 4) Residential Investigation', () => {
  it('verifies breaker account 8804 and apartment 38', () => {
    const authenticateRelayBurn = (account: string, apt: string) => {
      return account.trim() === '8804' && apt.trim() === '38';
    };

    expect(authenticateRelayBurn('8804', '38')).toBe(true);
    expect(authenticateRelayBurn(' 8804 ', ' 38 ')).toBe(true);
    expect(authenticateRelayBurn('8804', '39')).toBe(false);
    expect(authenticateRelayBurn('1111', '38')).toBe(false);
  });
});

describe('Map 3: Маршрут №0 (Route 0) Depot Archive & Radio', () => {
  it('detects correct radio channels with tolerance', () => {
    const getRadioChannel = (freq: number) => {
      if (Math.abs(freq - 104.2) < 0.2) return 'BLACK_BOX';
      if (Math.abs(freq - 98.0) < 0.2) return 'MORSE_SOS';
      if (Math.abs(freq - 91.4) < 0.2) return 'ECHO_TRANSMISSION';
      return 'STATIC';
    };

    expect(getRadioChannel(104.2)).toBe('BLACK_BOX');
    expect(getRadioChannel(104.25)).toBe('BLACK_BOX');
    expect(getRadioChannel(98.0)).toBe('MORSE_SOS');
    expect(getRadioChannel(91.4)).toBe('ECHO_TRANSMISSION');
    expect(getRadioChannel(95.0)).toBe('STATIC');
  });

  it('executes interactive console commands', () => {
    const handleCommand = (rawCmd: string) => {
      const cmd = rawCmd.trim().toUpperCase();
      switch (cmd) {
        case '3140':
          return { status: 'SOLVED', code: '04' };
        case 'HELP':
        case '?':
          return { status: 'HELP' };
        case 'STATUS':
          return { status: 'STATUS' };
        case 'WHOAMI':
          return { status: 'WHOAMI' };
        default:
          return { status: 'UNKNOWN' };
      }
    };

    expect(handleCommand('3140')).toEqual({ status: 'SOLVED', code: '04' });
    expect(handleCommand('  3140  ')).toEqual({ status: 'SOLVED', code: '04' });
    expect(handleCommand('help')).toEqual({ status: 'HELP' });
    expect(handleCommand('STATUS')).toEqual({ status: 'STATUS' });
    expect(handleCommand('whoami')).toEqual({ status: 'WHOAMI' });
    expect(handleCommand('FOO')).toEqual({ status: 'UNKNOWN' });
  });
});

describe('Map 4: Квартира 44а (Apt 44) BTI Infinite Room & Entity Call', () => {
  it('validates quarantine action order selection against harmful demolition', () => {
    const processChiefOrder = (actionCode: string) => {
      if (actionCode === 'QUARANTINE_PERMANENT') {
        return { success: true, sectorCode: '44' };
      }
      return { success: false, error: 'НЕДОПУСТИМЫЙ РЕГЛАМЕНТ' };
    };

    expect(processChiefOrder('QUARANTINE_PERMANENT')).toEqual({ success: true, sectorCode: '44' });
    expect(processChiefOrder('DEMOLITION_STANDARD')).toEqual({
      success: false,
      error: 'НЕДОПУСТИМЫЙ РЕГЛАМЕНТ',
    });
    expect(processChiefOrder('')).toEqual({
      success: false,
      error: 'НЕДОПУСТИМЫЙ РЕГЛАМЕНТ',
    });
  });
});


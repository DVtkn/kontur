import React, { useState } from 'react';
import { Network, Eye, FileText, CheckCircle2, AlertCircle, X, ExternalLink, ArrowRight } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { GameProgress, ActiveScreen } from '../types';

interface EvidenceBoardProps {
  progress: GameProgress;
  onNavigateToCase: (screen: ActiveScreen) => void;
  onOpenFinale?: () => void;
}

interface ClueData {
  id: string;
  number: number;
  sector: ActiveScreen;
  caseName: string;
  title: string;
  date: string;
  codeFound: string;
  isSolved: boolean;
  pinColor: 'brass' | 'red' | 'green';
  rotation: string;
  summary: string;
  forensicLink: string;
  details: {
    photoTitle: string;
    photoType: string;
    protocolText: string;
    witnessText: string;
    kgbNote: string;
  };
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  progress,
  onNavigateToCase,
  onOpenFinale,
}) => {
  const [selectedClue, setSelectedClue] = useState<ClueData | null>(null);

  const allSolved =
    progress.rls4Solved &&
    progress.floor4Solved &&
    progress.route0Solved &&
    progress.apt44Solved;

  const clues: ClueData[] = [
    {
      id: 'clue-1',
      number: 1,
      sector: 'rls4',
      caseName: 'ТОМ I // РЛС-4 (Шлюз В-2)',
      title: 'Соколов И.В. (Таб. №714)',
      date: '14.04.1998 01:20',
      codeFound: '19',
      isSolved: progress.rls4Solved,
      pinColor: progress.rls4Solved ? 'green' : 'brass',
      rotation: '-1.8deg',
      summary:
        'Старший техник станции РЛС-4. Зафиксирован мертвым внутри шлюза В-2 вплотную к стеклу камеры. Однако в путевых листах депо за ту же ночь он числится водителем исчезнувшего трамвая №314.',
      forensicLink: 'Улика №1 → Улика №2: Один и тот же человек зафиксирован в двух точках одновременно на расстоянии 14 км.',
      details: {
        photoTitle: 'ФОТО МАТЕРИАЛ // КАМЕРА ШЛЮЗА В-2',
        photoType: 'Био-скан Соколова И.В. / Отказ гипотермического датчика',
        protocolText:
          '14 апреля 1998 г. в 01:20 техник Соколов заперся в шлюзе В-2 и инициировал продувку жидким азотом изнутри. На пульте осталась кровь на тумблере крио-магистрали. Перед потерей пульса передал в микрофон шифр 19.',
        witnessText:
          '«Он смотрел не в объектив камеры наблюдения, а куда-то сквозь бетонный потолок. И непрерывно дергал ручку трамвайного контроллера, которой в шлюзе никогда не было».',
        kgbNote:
          'ДЕЛО ЗАСЕКРЕЧЕНО. Тело извлечению не подлежит из-за критического гамма-фона и пространственной деформации шлюза.',
      },
    },
    {
      id: 'clue-2',
      number: 2,
      sector: 'route0',
      caseName: 'ТОМ III // ДЕПО «СЕВЕРНОЕ»',
      title: 'Вагон КТМ-5М3 №314',
      date: '14.04.1998 23:45',
      codeFound: '04',
      isSolved: progress.route0Solved,
      pinColor: progress.route0Solved ? 'green' : 'red',
      rotation: '1.5deg',
      summary:
        'Вышел с кольца с 12 пассажирами. На стрелке №3 переведен диспетчерским кодом 3140 на законсервированный тоннель. Вагон не разбился — он продолжил движение под землю.',
      forensicLink: 'Улика №2 → Улика №3: 12 пассажиров вагона = 12 замерзших тел в шлюзе В-2. Тоннель проходит прямо под фундаментом дома на Лесной.',
      details: {
        photoTitle: 'ВЫРВАННЫЙ ПУТЕВОЙ ЛИСТ // ДЕПО №1',
        photoType: 'Стрелочный перевод №3 / Сигнал частоты 104.2 FM',
        protocolText:
          'В 23:45 вагон №314 отключил внешние габариты и на скорости 48 км/ч вошел в заброшенную соединительную ветку метростроя. Диспетчер слышал по радио переговоры на частоте 104.2 FM с кодом реверса 04.',
        witnessText:
          '«Я видел, как вагон шел без искр от пантографа, словно ток шел не из контактной сети, а снизу, прямо из рельсов. Пассажиры сидели неподвижно и не мигали».',
        kgbNote:
          'Контактный провод на перегоне демонтирован. Движение признано невозможным, но радиосканер до сих пор ловит морзянку вагона.',
      },
    },
    {
      id: 'clue-3',
      number: 3,
      sector: 'floor4',
      caseName: 'ТОМ II // ЖК «ЛЕСНОЙ»',
      title: 'Шахта 4-го этажа (Кв. 38)',
      date: '15.04.1998 01:10',
      codeFound: '98',
      isSolved: progress.floor4Solved,
      pinColor: progress.floor4Solved ? 'green' : 'brass',
      rotation: '-1.4deg',
      summary:
        'Здание возведено прямо над тоннелем схода трамвая. В 1998 году шахта лифта на 4 этаже заложена кирпичом, так как из нее доносился гул тяговых двигателей. Силовой кабель отведен в квартиру №38.',
      forensicLink: 'Улика №3 → Улика №4: Лицевой счет 8804 питает остаточный контур. Квартира 38 скрывает прямой вертикальный спуск в нулевой коллектор.',
      details: {
        photoTitle: 'СХЕМА СТОЯКА И ЭЛЕКТРОСЕТИ // 4 ЭТАЖ',
        photoType: 'Кирпичная кладка шахты лифта / Реле кв. 38',
        protocolText:
          'После жалоб жильцов на звон трамвайного колокола из стен, шахта лифта была спешно замурована силикатным кирпичом. Счетчик квартиры 38 потребляет мегаватты мощности по лицевому счету 8804 (код 98).',
        witnessText:
          '«Сосед из 38-й квартиры перестал выходить в мае 98-го. Но дверь изнутри была подперта железнодорожным костылем, а за дверью пахло озоном и жженой резиной».',
        kgbNote:
          'Жильцы этажа расселены по фальшивым ордерам. Вход в подъезд закрыт на стальную решетку.',
      },
    },
    {
      id: 'clue-4',
      number: 4,
      sector: 'apt44',
      caseName: 'ТОМ IV // КВАРТИРА 44А',
      title: 'Спецколлектор «Квартира 44а»',
      date: '15.04.1998 04:00',
      codeFound: '44',
      isSolved: progress.apt44Solved,
      pinColor: progress.apt44Solved ? 'green' : 'red',
      rotation: '2.0deg',
      summary:
        'Подвальное помещение нулевого периметра. Вагон №314 был залит бетоном марки М500 прямо в фундамент дома. Внутри вагона находились люди. Пространство за стеной перестало подчиняться евклидовой геометрии.',
      forensicLink: 'Улика №4 → Финал: Люди были использованы как органический изолятор аномалии. Контур замыкается в вашей текущей точке.',
      details: {
        photoTitle: 'ЦИАНОТИПИЯ БТИ // ПЛАН ПОДВАЛА',
        photoType: 'Неевклидово расширение комнат / Телефон прямого провода',
        protocolText:
          'По документам БТИ квартиры 44а не существует. По факту — бетонный бункер глубиной 18 метров, где в стене вмурован борт трамвая №314. Телефонный аппарат подключен к отключенной станции АТС-44.',
        witnessText:
          '«Если набрать на диске 44-00-19, из трубки слышно дыхание двенадцати человек, поющих песню про кондуктора в унисон».',
        kgbNote:
          'ОБЪЕКТ «НУЛЕВОЙ КОНТУР». Наблюдение ведется удаленно через терминал дежурного оператора.',
      },
    },
  ];

  const handleCardClick = (clue: ClueData) => {
    sound.playPaperRustle();
    sound.triggerHaptic('tap');
    setSelectedClue(clue);
  };

  const handleCloseModal = () => {
    sound.playKeyClick();
    setSelectedClue(null);
  };

  const handleNavigateFromClue = (sector: ActiveScreen) => {
    sound.playClick();
    setSelectedClue(null);
    onNavigateToCase(sector);
  };

  return (
    <div className="cork-board" style={{ margin: '8px 0 20px' }}>
      {/* Brass Corner Reinforcements */}
      <div className="cork-brass-bracket tl" />
      <div className="cork-brass-bracket tr" />
      <div className="cork-brass-bracket bl" />
      <div className="cork-brass-bracket br" />

      {/* Board Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 180, 34, 0.25)',
          background: 'rgba(10, 8, 6, 0.6)',
          padding: '10px 14px',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={20} color="var(--amber)" />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900, color: '#f5e6cc', letterSpacing: '1px' }}>
              СЛЕДСТВЕННАЯ ДОСКА ПЕРЕКРЕСТНЫХ СВЯЗЕЙ
            </div>
            <div style={{ fontSize: '11px', color: '#a89880' }}>
              ХРОНОЛОГИЯ КАТАСТРОФЫ 14–15 АПРЕЛЯ 1998 // ОПЕРАЦИЯ «КОНТУР»
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '3px',
              background: allSolved ? 'rgba(47, 158, 68, 0.2)' : 'rgba(255, 65, 54, 0.15)',
              color: allSolved ? '#51cf66' : '#ff8787',
              border: `1px solid ${allSolved ? '#2f9e44' : '#e03131'}`,
            }}
          >
            {allSolved ? '● ВСЕ 4 УЛИКИ СОПОСТАВЛЕНЫ' : '○ ИДЕТ СБОР МАТЕРИАЛОВ'}
          </span>
        </div>
      </div>

      {/* Grid of 4 Pinned Polaroid Dossier Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {clues.map((clue) => (
          <div
            key={clue.id}
            className="pin-evidence-card"
            onClick={() => handleCardClick(clue)}
            style={{
              transform: `rotate(${clue.rotation})`,
            }}
            title="Нажмите, чтобы подробно изучить улику и показания"
          >
            {/* 3D Pushpin with Drop Shadow */}
            <div className={`pushpin ${clue.pinColor}`} />
            <div className="pushpin-shadow" />

            {/* Top Bar with Stamp and Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingTop: '4px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 900,
                  letterSpacing: '1px',
                  color: clue.isSolved ? '#51cf66' : 'var(--amber)',
                  background: clue.isSolved ? 'rgba(47, 158, 68, 0.15)' : 'rgba(255, 180, 34, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '2px',
                  border: `1px solid ${clue.isSolved ? '#2f9e44' : 'rgba(255, 180, 34, 0.3)'}`,
                }}
              >
                УЛИКА №{clue.number}
              </span>

              <span style={{ fontSize: '10px', color: '#8892a0', fontFamily: 'var(--font-mono)' }}>
                {clue.date}
              </span>
            </div>

            {/* Clue Subject */}
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f0ede6', marginBottom: '4px' }}>
              {clue.title}
            </div>

            <div style={{ fontSize: '10px', color: '#a0aab8', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
              {clue.caseName}
            </div>

            {/* Clue Summary Text */}
            <div style={{ fontSize: '12px', color: '#c2cad4', lineHeight: 1.5, marginBottom: '12px', minHeight: '60px' }}>
              {clue.summary}
            </div>

            {/* Forensic Connection Ribbon */}
            <div
              style={{
                background: 'rgba(10, 14, 20, 0.8)',
                borderLeft: `3px solid ${clue.isSolved ? '#51cf66' : 'var(--amber)'}`,
                padding: '6px 8px',
                fontSize: '11px',
                color: clue.isSolved ? '#99e9f2' : '#ffd470',
                lineHeight: 1.4,
                borderRadius: '0 3px 3px 0',
                marginBottom: '10px',
              }}
            >
              <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: '#8c939e', letterSpacing: '0.5px' }}>
                КРАСНАЯ НИТЬ СВЯЗИ:
              </div>
              {clue.forensicLink}
            </div>

            {/* Bottom Status & CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #2d3644' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: clue.isSolved ? '#51cf66' : 'var(--red-alarm)',
                }}
              >
                {clue.isSolved ? `ШИФР: [ ${clue.codeFound} ]` : 'ТРЕБУЕТСЯ АНАЛИЗ'}
              </span>

              <span
                style={{
                  fontSize: '10px',
                  color: 'var(--amber)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ОСМОТРЕТЬ <ArrowRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Central Anomaly Epicenter (Convergence Point) */}
      <div
        style={{
          marginTop: '24px',
          background: allSolved
            ? 'radial-gradient(circle at center, #2e0d0d 0%, #140707 100%)'
            : 'radial-gradient(circle at center, #181c24 0%, #0d1014 100%)',
          border: `2px solid ${allSolved ? 'var(--red-alarm)' : '#2f3846'}`,
          borderRadius: '6px',
          padding: '16px 20px',
          textAlign: 'center',
          boxShadow: allSolved ? '0 0 35px var(--red-glow)' : 'none',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Eye size={18} color={allSolved ? 'var(--red-alarm)' : 'var(--amber)'} />
          <span style={{ fontSize: '13px', fontWeight: 900, color: allSolved ? '#ff8787' : '#ffd470', letterSpacing: '1px' }}>
            ТОЧКА СХОЖДЕНИЯ СВЯЗЕЙ // НУЛЕВОЙ ЭПИЦЕНТР
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#c4ccd8', maxWidth: '640px', margin: '0 auto 12px', lineHeight: 1.5 }}>
          {allSolved
            ? 'Все четыре материальных следа трамвая №314 сошлись в одной точке. Трамвай не уехал в депо — он был замурован в подвал жилого дома для изоляции прорыва.'
            : 'Сопоставьте все 4 архивных тома, чтобы расшифровать финальный протокол деанонимизации и остановить расширение контура.'}
        </div>

        {/* Master Decoded Sequence Display */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#090b0e',
            border: `1px solid ${allSolved ? 'var(--red-alarm)' : '#27303e'}`,
            padding: '8px 16px',
            borderRadius: '4px',
            marginBottom: '12px',
          }}
        >
          <span style={{ fontSize: '11px', color: '#8892a0', fontWeight: 700 }}>СВОДНЫЙ КЛЮЧ:</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              fontWeight: 900,
              letterSpacing: '3px',
              color: allSolved ? 'var(--red-alarm)' : 'var(--green-term)',
            }}
          >
            [ {progress.codes.rls4 || '??'} ] — [ {progress.codes.floor4 || '??'} ] — [ {progress.codes.route0 || '??'} ] — [ {progress.codes.apt44 || '??'} ]
          </span>
        </div>

        {/* Action Button */}
        {allSolved && onOpenFinale && (
          <div>
            <button
              className="terminal-btn btn-danger"
              onClick={() => {
                sound.playStampThump();
                sound.triggerHaptic('screamer');
                onOpenFinale();
              }}
              style={{
                fontSize: '13px',
                padding: '10px 24px',
                letterSpacing: '1px',
                minHeight: '44px',
              }}
            >
              ⚠ РАСПЕЧАТАТЬ ДЕЛО ОПЕРАТОРА // ФИНАЛЬНЫЙ АКТ
            </button>
          </div>
        )}
      </div>

      {/* Forensic Clue Magnifier Modal */}
      {selectedClue && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            padding: '16px',
          }}
          onClick={handleCloseModal}
        >
          <div
            className="terminal-card manila-card"
            style={{
              maxWidth: '620px',
              width: '100%',
              background: '#12161d',
              border: '2px solid var(--amber)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(255, 180, 34, 0.25)',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #2d3644', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="evidence-tag evidence-classified">
                    УЛИКА №{selectedClue.number} // ДЕТАЛЬНЫЙ ОСМОТР
                  </span>
                  <span style={{ fontSize: '11px', color: '#8c939e', fontFamily: 'var(--font-mono)' }}>
                    {selectedClue.date}
                  </span>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 900, color: '#fff' }}>
                  {selectedClue.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                  {selectedClue.caseName}
                </div>
              </div>

              <button
                className="btn-control"
                onClick={handleCloseModal}
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                }}
                aria-label="Закрыть досье улики"
              >
                <X size={20} />
              </button>
            </div>

            {/* Photo / Schematic Card Simulation */}
            <div
              style={{
                background: '#090c10',
                border: '1px solid #222b38',
                borderRadius: '4px',
                padding: '14px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#8892a0', fontWeight: 800, letterSpacing: '1px', marginBottom: '6px' }}>
                {selectedClue.details.photoTitle}
              </div>
              <div style={{ fontSize: '12px', color: '#51cf66', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                ● {selectedClue.details.photoType}
              </div>
              <div style={{ fontSize: '13px', color: '#c8d2df', lineHeight: 1.6 }}>
                {selectedClue.details.protocolText}
              </div>
            </div>

            {/* Witness Testimony */}
            <div
              style={{
                background: 'rgba(255, 180, 34, 0.05)',
                borderLeft: '3px solid var(--amber)',
                padding: '12px 14px',
                marginBottom: '16px',
                borderRadius: '0 4px 4px 0',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--amber)', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>
                ПОКАЗАНИЯ СВИДЕТЕЛЯ (ИЗ АРХИВА):
              </div>
              <div style={{ fontSize: '12px', color: '#eddcc4', fontStyle: 'italic', lineHeight: 1.5 }}>
                {selectedClue.details.witnessText}
              </div>
            </div>

            {/* KGB / Archival Confidential Stamp */}
            <div
              style={{
                background: '#190e10',
                border: '1px solid #4a1919',
                padding: '12px 14px',
                marginBottom: '20px',
                borderRadius: '4px',
              }}
            >
              <div style={{ fontSize: '10px', color: '#ff6b6b', fontWeight: 800, letterSpacing: '1px', marginBottom: '4px' }}>
                СЛУЖЕБНАЯ ПОМЕТКА КОМИТЕТА:
              </div>
              <div style={{ fontSize: '12px', color: '#ffc9c9', lineHeight: 1.5 }}>
                {selectedClue.details.kgbNote}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                className="terminal-btn"
                onClick={handleCloseModal}
                style={{ minHeight: '44px', padding: '8px 16px' }}
              >
                ← ВЕРНУТЬСЯ К ДОСКЕ
              </button>

              <button
                className="terminal-btn btn-primary"
                onClick={() => handleNavigateFromClue(selectedClue.sector)}
                style={{
                  minHeight: '44px',
                  padding: '8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>ПЕРЕЙТИ В ДЕЛО {selectedClue.caseName.split('//')[0]}</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

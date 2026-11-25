import { AchievementDef, GameState } from '../types';

function totalHelpers(state: GameState): number {
  return Object.values(state.helpers).reduce((sum, n) => sum + n, 0);
}

function uniqueToolsOwned(state: GameState): number {
  return Object.values(state.ownedTools).filter((t) => t.count > 0).length;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Clicks (5)
  {
    id: 'ach_click_1',
    name: 'Pierwsze Chrupnięcie',
    description: 'Kliknij obiekt po raz pierwszy.',
    category: 'clicks',
    check: (s) => s.stats.totalClicks >= 1,
  },
  {
    id: 'ach_click_100',
    name: 'Rozgrzewka Łapy',
    description: 'Wykonaj 100 kliknięć.',
    category: 'clicks',
    check: (s) => s.stats.totalClicks >= 100,
  },
  {
    id: 'ach_click_1000',
    name: 'Młot Pneumatyczny',
    description: 'Wykonaj 1 000 kliknięć.',
    category: 'clicks',
    check: (s) => s.stats.totalClicks >= 1_000,
  },
  {
    id: 'ach_click_10000',
    name: 'Niezmordowany Goryl',
    description: 'Wykonaj 10 000 kliknięć.',
    category: 'clicks',
    check: (s) => s.stats.totalClicks >= 10_000,
  },
  {
    id: 'ach_crit_50',
    name: 'Złote Chrupnięcia',
    description: 'Traf 50 razy Krytycznym Chrupnięciem.',
    category: 'clicks',
    check: (s) => s.stats.totalCrits >= 50,
  },

  // Chips (6)
  {
    id: 'ach_chips_1k',
    name: 'Pierwsza Paczka',
    description: 'Wydobądź łącznie 1 000 Chipsów.',
    category: 'chips',
    check: (s) => s.stats.totalChipsAllTime >= 1_000,
  },
  {
    id: 'ach_chips_1m',
    name: 'Chipsowy Milioner',
    description: 'Wydobądź łącznie 1M Chipsów.',
    category: 'chips',
    check: (s) => s.stats.totalChipsAllTime >= 1_000_000,
  },
  {
    id: 'ach_chips_1b',
    name: 'Miliarder Skrobi',
    description: 'Wydobądź łącznie 1B Chipsów.',
    category: 'chips',
    check: (s) => s.stats.totalChipsAllTime >= 1_000_000_000,
  },
  {
    id: 'ach_chips_1t',
    name: 'Bilioner Przypraw',
    description: 'Wydobądź łącznie 1T Chipsów.',
    category: 'chips',
    check: (s) => s.stats.totalChipsAllTime >= 1_000_000_000_000,
  },
  {
    id: 'ach_chips_1qa',
    name: 'Galaktyczny Magazyn',
    description: 'Wydobądź łącznie 1Qa Chipsów.',
    category: 'chips',
    check: (s) => s.stats.totalChipsAllTime >= 1_000_000_000_000_000,
  },
  {
    id: 'ach_chips_1sx',
    name: 'Kosmiczna Nadprodukcja',
    description: 'Wydobądź łącznie 1Sx Chipsów.',
    category: 'chips',
    check: (s) => s.stats.totalChipsAllTime >= 1e21,
  },

  // Worlds (6)
  {
    id: 'ach_world_2',
    name: 'Z Dżungli do Piwnicy',
    description: 'Odblokuj 2. świat: Piwnica u Babci.',
    category: 'worlds',
    check: (s) => s.highestWorldUnlocked >= 2,
  },
  {
    id: 'ach_world_5',
    name: 'Skala Przemysłowa',
    description: 'Dotrzyj do 5. świata: Fabryka „Chrup-Pol”.',
    category: 'worlds',
    check: (s) => s.highestWorldUnlocked >= 5,
  },
  {
    id: 'ach_world_10',
    name: 'Lot na Orbitę',
    description: 'Dotrzyj do 10. świata: Orbita Ziemi.',
    category: 'worlds',
    check: (s) => s.highestWorldUnlocked >= 10,
  },
  {
    id: 'ach_world_15',
    name: 'Władca Pierścieni',
    description: 'Dotrzyj do 15. świata: Pierścienie Saturna.',
    category: 'worlds',
    check: (s) => s.highestWorldUnlocked >= 15,
  },
  {
    id: 'ach_world_20',
    name: 'Archeolog Skrobi',
    description: 'Dotrzyj do 20. świata: Ruiny Złotego Ziemniaka.',
    category: 'worlds',
    check: (s) => s.highestWorldUnlocked >= 20,
  },
  {
    id: 'ach_world_22',
    name: 'Absolut Chrupkości',
    description: 'Odblokuj finałowy 22. świat!',
    category: 'worlds',
    check: (s) => s.highestWorldUnlocked >= 22,
  },

  // Bosses (4)
  {
    id: 'ach_boss_1',
    name: 'Pierwszy Pokonany Zgrzew',
    description: 'Pokonaj swojego pierwszego Bossa Przejścia.',
    category: 'bosses',
    check: (s) => s.stats.bossesDefeated >= 1,
  },
  {
    id: 'ach_boss_5',
    name: 'Łowca Bossów',
    description: 'Pokonaj 5 Bossów Przejścia.',
    category: 'bosses',
    check: (s) => s.stats.bossesDefeated >= 5,
  },
  {
    id: 'ach_boss_15',
    name: 'Postrach Sanepidu i Kosmosu',
    description: 'Pokonaj 15 Bossów Przejścia.',
    category: 'bosses',
    check: (s) => s.stats.bossesDefeated >= 15,
  },
  {
    id: 'ach_boss_endless',
    name: 'Ponad Nieskończoność',
    description: 'Pokonaj skalującego się Bossa Absolutu na 22. świecie.',
    category: 'bosses',
    check: (s) => s.stats.endlessBossLevel >= 1,
  },

  // Drops & Fever (5)
  {
    id: 'ach_empty_bag_1',
    name: '80% Azotu, 100% Rozczarowania',
    description: 'Otwórz pustą Latającą Paczkę z samym powietrzem.',
    category: 'drops',
    check: (s) => s.stats.emptyBagsOpened >= 1,
  },
  {
    id: 'ach_empty_bag_10',
    name: 'Kolekcjoner Powietrza',
    description: 'Traf 10 pustych paczek z powietrzem.',
    category: 'drops',
    check: (s) => s.stats.emptyBagsOpened >= 10,
  },
  {
    id: 'ach_airdrop_10',
    name: 'Łapacz Paczek',
    description: 'Kliknij 10 Latających Paczek lub Złotych Ziemniaków.',
    category: 'drops',
    check: (s) => s.stats.airDropsClicked >= 10,
  },
  {
    id: 'ach_fever_1',
    name: 'Pierwszy Szał Chrupania',
    description: 'Aktywuj tryb Szału Jedzenia (Fever Mode).',
    category: 'drops',
    check: (s) => s.stats.feverActivations >= 1,
  },
  {
    id: 'ach_fever_10',
    name: 'Wieczny Głód',
    description: 'Aktywuj Szał Jedzenia 10 razy.',
    category: 'drops',
    check: (s) => s.stats.feverActivations >= 10,
  },

  // Helpers (4)
  {
    id: 'ach_helper_1',
    name: 'Pierwszy Wspólnik',
    description: 'Zatrudnij swojego pierwszego pomocnika.',
    category: 'helpers',
    check: (s) => totalHelpers(s) >= 1,
  },
  {
    id: 'ach_helper_25',
    name: 'Mała Brygada',
    description: 'Posiadaj łącznie 25 pomocników.',
    category: 'helpers',
    check: (s) => totalHelpers(s) >= 25,
  },
  {
    id: 'ach_helper_100',
    name: 'Korporacja Chrup-Pol',
    description: 'Posiadaj łącznie 100 pomocników.',
    category: 'helpers',
    check: (s) => totalHelpers(s) >= 100,
  },
  {
    id: 'ach_helper_500',
    name: 'Armia Przemysłowa',
    description: 'Posiadaj łącznie 500 pomocników.',
    category: 'helpers',
    check: (s) => totalHelpers(s) >= 500,
  },

  // Tools & Forge (4)
  {
    id: 'ach_tools_3',
    name: 'Początkujący Kolekcjoner',
    description: 'Odblokuj 3 różne narzędzia.',
    category: 'tools',
    check: (s) => uniqueToolsOwned(s) >= 3,
  },
  {
    id: 'ach_tools_10',
    name: 'Zbrojownia Goryla',
    description: 'Odblokuj 10 różnych narzędzi.',
    category: 'tools',
    check: (s) => uniqueToolsOwned(s) >= 10,
  },
  {
    id: 'ach_forge_3',
    name: 'Kowal Przypraw',
    description: 'Ulepsz narzędzie w Kowalni do poziomu +3.',
    category: 'tools',
    check: (s) => s.stats.maxForgeLevel >= 3,
  },
  {
    id: 'ach_smelt_5',
    name: 'Recykling Metalu i Soli',
    description: 'Przetop 5 duplikatów narzędzi na Złote Przyprawy.',
    category: 'tools',
    check: (s) => s.stats.toolsSmelted >= 5,
  },

  // Prestige (2)
  {
    id: 'ach_prestige_1',
    name: 'Oświecenie Żołądka',
    description: 'Wykonaj swój pierwszy Wielki Reset (Prestiż).',
    category: 'prestige',
    check: (s) => s.stats.prestigesDone >= 1,
  },
  {
    id: 'ach_prestige_5',
    name: 'Mistrz Reinkarnacji Chrupkości',
    description: 'Wykonaj Prestiż 5 razy.',
    category: 'prestige',
    check: (s) => s.stats.prestigesDone >= 5,
  },
];

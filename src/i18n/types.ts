import { SupportedLanguage } from '../types/story';

export type AppLanguage = SupportedLanguage;

export interface TranslationDictionary {
  common: {
    appName: string;
    tagline: string;
    loading: string;
    save: string;
    cancel: string;
    back: string;
    next: string;
    finish: string;
    delete: string;
    dismiss: string;
    retry: string;
    modeDemo: string;
    modeAI: string;
    statusActive: string;
    statusCompleted: string;
    statusArchived: string;
  };
  navigation: {
    home: string;
    create: string;
    library: string;
    settings: string;
    reader: string;
  };
  login: {
    portalGate: string;
    authRequired: string;
    googleSignIn: string;
    authDescription: string;
    verifiedIdentity: string;
    heroChronicles: string;
    instantAccess: string;
    configRequired: string;
    configNotice: string;
    bypassTesting: string;
    initError: string;
    signedInAs: string;
    enterApp: string;
    signOut: string;
  };
  home: {
    welcomeHero: string;
    continueJourney: string;
    quickPlay: string;
    newHero: string;
    recentChronicles: string;
    noStoriesTitle: string;
    noStoriesDesc: string;
    startFirstStory: string;
    featuredScenarios: string;
    exploreWorld: string;
  };
  create: {
    stepHero: string;
    stepGenre: string;
    stepWorld: string;
    stepSettings: string;
    heroName: string;
    heroNamePlaceholder: string;
    heroOrigin: string;
    heroClass: string;
    storyTone: string;
    pacing: string;
    difficulty: string;
    storyLanguage: string;
    storyLanguageDesc: string;
    generationMode: string;
    generationModeDesc: string;
    modeAIDesc: string;
    modeDemoDesc: string;
    launchStory: string;
    generatingStory: string;
  };
  reader: {
    chapter: string;
    turn: string;
    health: string;
    stamina: string;
    power: string;
    inventory: string;
    quests: string;
    relationships: string;
    customActionPlaceholder: string;
    takeAction: string;
    viewTranscript: string;
    exitStory: string;
    gameOver: string;
    victory: string;
    actionRequiresStamina: string;
    actionRequiresItem: string;
    aiThinking: string;
  };
  library: {
    title: string;
    totalStories: string;
    filterAll: string;
    filterActive: string;
    filterArchived: string;
    openStory: string;
    archiveStory: string;
    unarchiveStory: string;
    deleteConfirm: string;
  };
  settings: {
    title: string;
    appearance: string;
    darkMode: string;
    appLanguage: string;
    appLanguageDesc: string;
    aiBackendStatus: string;
    modelA: string;
    modelB: string;
    quotaStatus: string;
    dataManagement: string;
    exportBackup: string;
    importBackup: string;
    about: string;
    version: string;
  };
  errors: {
    rateLimitUser: string;
    rateLimitGlobal: string;
    modelQuotaExhausted: string;
    aiUnavailable: string;
    aiDisabledFallback: string;
    networkError: string;
    unauthorized: string;
  };
}

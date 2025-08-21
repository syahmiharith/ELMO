
export type FeatureKey =
  | 'dashboard'
  | 'recommendations'
  | 'orders'
  | 'tickets'
  | 'profile'
  | 'settings'
  | 'dashboard:my-clubs'
  | 'dashboard:my-rsvps'
  | 'dashboard:upcoming-events';

type Flags = Record<FeatureKey, boolean>;

const defaults: Flags = {
  dashboard: true, // Keep dashboard nav link enabled by default
  recommendations: false,
  orders: false,
  tickets: false,
  profile: false,
  settings: false,
  'dashboard:my-clubs': false,
  'dashboard:my-rsvps': false,
  'dashboard:upcoming-events': false,
};

function fromEnv(): Partial<Flags> {
  // Note: Next.js requires env vars to be prefixed with NEXT_PUBLIC_ to be available on the client.
  return {
    dashboard: process.env.NEXT_PUBLIC_FF_DASHBOARD === 'true',
    recommendations: process.env.NEXT_PUBLIC_FF_RECOMMENDATIONS === 'true',
    orders: process.env.NEXT_PUBLIC_FF_ORDERS === 'true',
    tickets: process.env.NEXT_PUBLIC_FF_TICKETS === 'true',
    profile: process.env.NEXT_PUBLIC_FF_PROFILE === 'true',
    settings: process.env.NEXT_PUBLIC_FF_SETTINGS === 'true',
    'dashboard:my-clubs': process.env.NEXT_PUBLIC_FF_DASHBOARD_MY_CLUBS === 'true',
    'dashboard:my-rsvps': process.env.NEXT_PUBLIC_FF_DASHBOARD_MY_RSVPS === 'true',
    'dashboard:upcoming-events': process.env.NEXT_PUBLIC_FF_DASHBOARD_UPCOMING_EVENTS === 'true',
  };
}

let runtime: Partial<Flags> = {};
let listeners = new Set<() => void>();

export const featureFlags = {
  get(): Flags {
    // Precedence: runtime > env > defaults
    return { ...defaults, ...fromEnv(), ...runtime };
  },

  setRuntime(overrides: Partial<Flags>) {
    runtime = overrides;
    listeners.forEach((l) => l());
  },

  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
};

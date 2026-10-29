// Development inspectors load before the app. The guarded import is eliminated from production builds.
const start = async () => {
  if (import.meta.env.DEV) {
    void import('./lib/dev-tools');
  }

  await import('./index');
};

void start();

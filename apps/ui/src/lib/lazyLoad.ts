export async function lazyLoadComponent(componentPath: string) {
  try {
    const module = await import(componentPath);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${componentPath}`, error);
    throw error;
  }
}

export function createLazyLoader<T>(loader: () => Promise<T>) {
  let cached: T | null = null;
  let loading: Promise<T> | null = null;

  return async (): Promise<T> => {
    if (cached) return cached;
    if (loading) return loading;

    loading = loader();
    cached = await loading;
    loading = null;

    return cached;
  };
}

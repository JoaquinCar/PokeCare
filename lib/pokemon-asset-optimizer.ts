// Pokemon Asset Loading Optimization
class PokemonAssetOptimizer {
  private static instance: PokemonAssetOptimizer
  private imageCache = new Map<string, HTMLImageElement>()
  private loadingPromises = new Map<string, Promise<HTMLImageElement>>()
  private preloadedAssets = new Set<string>()

  private constructor() {}

  public static getInstance(): PokemonAssetOptimizer {
    if (!PokemonAssetOptimizer.instance) {
      PokemonAssetOptimizer.instance = new PokemonAssetOptimizer()
    }
    return PokemonAssetOptimizer.instance
  }

  // Preload critical Pokemon sprites
  public async preloadCriticalAssets(pokemonIds: number[]): Promise<void> {
    const preloadPromises = pokemonIds.slice(0, 20).map(async (id) => {
      const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      const animatedUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`

      await Promise.allSettled([this.preloadImage(spriteUrl), this.preloadImage(animatedUrl)])
    })

    await Promise.allSettled(preloadPromises)
  }

  // Optimized image preloading with caching
  public async preloadImage(url: string): Promise<HTMLImageElement> {
    if (this.imageCache.has(url)) {
      return this.imageCache.get(url)!
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        this.imageCache.set(url, img)
        this.preloadedAssets.add(url)
        resolve(img)
      }

      img.onerror = () => {
        this.loadingPromises.delete(url)
        reject(new Error(`Failed to load image: ${url}`))
      }

      img.src = url
    })

    this.loadingPromises.set(url, loadPromise)
    return loadPromise
  }

  // Get optimized Pokemon sprite URL
  public getOptimizedSpriteUrl(pokemonId: number, animated = true): string {
    if (animated) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`
    }
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
  }

  // Check if asset is preloaded
  public isAssetPreloaded(url: string): boolean {
    return this.preloadedAssets.has(url)
  }

  // Clear cache to manage memory
  public clearCache(): void {
    this.imageCache.clear()
    this.loadingPromises.clear()
    this.preloadedAssets.clear()
  }

  // Get cache size for debugging
  public getCacheInfo(): { size: number; preloaded: number } {
    return {
      size: this.imageCache.size,
      preloaded: this.preloadedAssets.size,
    }
  }
}

export { PokemonAssetOptimizer }

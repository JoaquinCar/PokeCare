// Classic Pokemon Game Theme Configuration
export const pokemonTheme = {
  colors: {
    primary: {
      blue: "#3B82F6",
      darkBlue: "#1E40AF",
      lightBlue: "#93C5FD",
    },
    secondary: {
      red: "#EF4444",
      darkRed: "#DC2626",
      lightRed: "#FCA5A5",
    },
    accent: {
      yellow: "#FCD34D",
      darkYellow: "#F59E0B",
      lightYellow: "#FEF3C7",
    },
    success: {
      green: "#10B981",
      darkGreen: "#059669",
      lightGreen: "#A7F3D0",
    },
    backgrounds: {
      primary: "from-blue-200 via-blue-300 to-blue-400",
      secondary: "from-red-200 via-red-300 to-red-400",
      accent: "from-yellow-200 via-yellow-300 to-yellow-400",
      success: "from-green-200 via-green-300 to-green-400",
    },
  },
  typography: {
    heading: "font-bold uppercase tracking-wide",
    subheading: "font-semibold uppercase tracking-wide",
    body: "font-medium",
    button: "font-bold uppercase tracking-wide",
  },
  borders: {
    classic: "border-2 border-gray-800",
    thick: "border-4 border-gray-800",
    colored: (color: string) => `border-2 border-${color}-800`,
  },
  shadows: {
    classic: "shadow-lg",
    heavy: "shadow-2xl",
    button: "shadow-xl",
  },
  animations: {
    hover: "hover:scale-105 active:scale-95 transition-all duration-200",
    bounce: "animate-bounce",
    pulse: "animate-pulse",
    spin: "animate-spin",
  },
}

export const pokemonTypeColors: { [key: string]: string } = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
}

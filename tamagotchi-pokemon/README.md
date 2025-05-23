# Tamagotchi Pokémon Web App

This project is a Tamagotchi-themed web application that displays all Pokémon in their base form using GIFs from the PokéAPI. The Pokémon are organized by pages for each Pokémon region. Users can click on a Pokémon to view its statistics and evolution details.

## Features

- Displays Pokémon organized by region.
- Each Pokémon is shown with its GIF and name.
- Clicking on a Pokémon opens a modal with detailed statistics and evolution information.
- Pagination for easy navigation between different Pokémon regions.

## Project Structure

```
tamagotchi-pokemon
├── public
│   └── index.html          # Main HTML file for the application
├── src
│   ├── components          # Contains reusable components
│   │   ├── PokemonCard.jsx # Component to display individual Pokémon
│   │   ├── PokemonList.jsx # Component to fetch and display Pokémon list
│   │   ├── PokemonModal.jsx # Component to show Pokémon details in a modal
│   │   └── RegionPagination.jsx # Component for pagination by region
│   ├── pages
│   │   └── Home.jsx       # Main page integrating Pokémon list and pagination
│   ├── services
│   │   └── pokeapi.js     # Functions to interact with the PokéAPI
│   ├── assets              # Directory for images and other assets
│   ├── App.jsx             # Main application component
│   ├── App.css             # CSS styles for the application
│   ├── index.css           # Global CSS styles
│   └── main.jsx            # Entry point of the React application
├── package.json            # npm configuration file
├── vite.config.js          # Vite configuration file
└── README.md               # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd tamagotchi-pokemon
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Technologies Used

- React
- Vite
- PokéAPI
- CSS

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.
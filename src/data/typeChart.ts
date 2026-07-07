export type TypeMatchup = {
  name: string;
  attacking: { double: string[]; half: string[]; none: string[] };
  defending: { double: string[]; half: string[]; none: string[] };
};

export const typeChart: TypeMatchup[] = [
  { 'name': 'Bug', 'attacking': { 'double': ['Grass', 'Psychic', 'Dark'], 'half': ['Fighting', 'Flying', 'Poison', 'Ghost', 'Steel', 'Fire', 'Fairy'], 'none': [] }, 'defending': { 'double': ['Flying', 'Rock', 'Fire'], 'half': ['Fighting', 'Ground', 'Grass'], 'none': [] } },
  { 'name': 'Dark', 'attacking': { 'double': ['Ghost', 'Psychic'], 'half': ['Fighting', 'Dark', 'Fairy'], 'none': [] }, 'defending': { 'double': ['Fighting', 'Bug', 'Fairy'], 'half': ['Ghost', 'Dark'], 'none': ['Psychic'] } },
  { 'name': 'Dragon', 'attacking': { 'double': ['Dragon'], 'half': ['Steel'], 'none': ['Fairy'] }, 'defending': { 'double': ['Ice', 'Dragon', 'Fairy'], 'half': ['Fire', 'Water', 'Grass', 'Electric'], 'none': [] } },
  { 'name': 'Electric', 'attacking': { 'double': ['Flying', 'Water'], 'half': ['Grass', 'Electric', 'Dragon'], 'none': ['Ground'] }, 'defending': { 'double': ['Ground'], 'half': ['Flying', 'Steel', 'Electric'], 'none': [] } },
  { 'name': 'Fairy', 'attacking': { 'double': ['Fighting', 'Dragon', 'Dark'], 'half': ['Poison', 'Steel', 'Fire'], 'none': [] }, 'defending': { 'double': ['Poison', 'Steel'], 'half': ['Fighting', 'Bug', 'Dark'], 'none': ['Dragon'] } },
  { 'name': 'Fighting', 'attacking': { 'double': ['Normal', 'Rock', 'Steel', 'Ice', 'Dark'], 'half': ['Flying', 'Poison', 'Bug', 'Psychic', 'Fairy'], 'none': ['Ghost'] }, 'defending': { 'double': ['Flying', 'Psychic', 'Fairy'], 'half': ['Rock', 'Bug', 'Dark'], 'none': [] } },
  { 'name': 'Fire', 'attacking': { 'double': ['Bug', 'Steel', 'Grass', 'Ice'], 'half': ['Rock', 'Fire', 'Water', 'Dragon'], 'none': [] }, 'defending': { 'double': ['Ground', 'Rock', 'Water'], 'half': ['Bug', 'Steel', 'Fire', 'Grass', 'Ice', 'Fairy'], 'none': [] } },
  { 'name': 'Flying', 'attacking': { 'double': ['Fighting', 'Bug', 'Grass'], 'half': ['Rock', 'Steel', 'Electric'], 'none': [] }, 'defending': { 'double': ['Rock', 'Electric', 'Ice'], 'half': ['Fighting', 'Bug', 'Grass'], 'none': ['Ground'] } },
  { 'name': 'Ghost', 'attacking': { 'double': ['Ghost', 'Psychic'], 'half': ['Dark'], 'none': ['Normal'] }, 'defending': { 'double': ['Ghost', 'Dark'], 'half': ['Poison', 'Bug'], 'none': ['Normal', 'Fighting'] } },
  { 'name': 'Grass', 'attacking': { 'double': ['Ground', 'Rock', 'Water'], 'half': ['Flying', 'Poison', 'Bug', 'Steel', 'Fire', 'Grass', 'Dragon'], 'none': [] }, 'defending': { 'double': ['Flying', 'Poison', 'Bug', 'Fire', 'Ice'], 'half': ['Ground', 'Water', 'Grass', 'Electric'], 'none': [] } },
  { 'name': 'Ground', 'attacking': { 'double': ['Poison', 'Rock', 'Steel', 'Fire', 'Electric'], 'half': ['Bug', 'Grass'], 'none': ['Flying'] }, 'defending': { 'double': ['Water', 'Grass', 'Ice'], 'half': ['Poison', 'Rock'], 'none': ['Electric'] } },
  { 'name': 'Ice', 'attacking': { 'double': ['Flying', 'Ground', 'Grass', 'Dragon'], 'half': ['Steel', 'Fire', 'Water', 'Ice'], 'none': [] }, 'defending': { 'double': ['Fighting', 'Rock', 'Steel', 'Fire'], 'half': ['Ice'], 'none': [] } },
  { 'name': 'Normal', 'attacking': { 'double': [], 'half': ['Rock', 'Steel'], 'none': ['Ghost'] }, 'defending': { 'double': ['Fighting'], 'half': [], 'none': ['Ghost'] } },
  { 'name': 'Poison', 'attacking': { 'double': ['Grass', 'Fairy'], 'half': ['Poison', 'Ground', 'Rock', 'Ghost'], 'none': ['Steel'] }, 'defending': { 'double': ['Ground', 'Psychic'], 'half': ['Fighting', 'Poison', 'Bug', 'Grass', 'Fairy'], 'none': [] } },
  { 'name': 'Psychic', 'attacking': { 'double': ['Fighting', 'Poison'], 'half': ['Steel', 'Psychic'], 'none': ['Dark'] }, 'defending': { 'double': ['Bug', 'Ghost', 'Dark'], 'half': ['Fighting', 'Psychic'], 'none': [] } },
  { 'name': 'Rock', 'attacking': { 'double': ['Flying', 'Bug', 'Fire', 'Ice'], 'half': ['Fighting', 'Ground', 'Steel'], 'none': [] }, 'defending': { 'double': ['Fighting', 'Ground', 'Steel', 'Water', 'Grass'], 'half': ['Normal', 'Flying', 'Poison', 'Fire'], 'none': [] } },
  { 'name': 'Steel', 'attacking': { 'double': ['Rock', 'Ice', 'Fairy'], 'half': ['Steel', 'Fire', 'Water', 'Electric'], 'none': [] }, 'defending': { 'double': ['Fighting', 'Ground', 'Fire'], 'half': ['Normal', 'Flying', 'Rock', 'Bug', 'Steel', 'Grass', 'Psychic', 'Ice', 'Dragon', 'Fairy'], 'none': ['Poison'] } },
  { 'name': 'Stellar', 'attacking': { 'double': [], 'half': [], 'none': [] }, 'defending': { 'double': [], 'half': [], 'none': [] } },
  { 'name': 'Water', 'attacking': { 'double': ['Ground', 'Rock', 'Fire'], 'half': ['Water', 'Grass', 'Dragon'], 'none': [] }, 'defending': { 'double': ['Grass', 'Electric'], 'half': ['Steel', 'Fire', 'Water', 'Ice'], 'none': [] } },
];

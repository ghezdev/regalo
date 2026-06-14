export const DUNGEON_FONT_FAMILY = "DungeonFont";

export const LOGIN_TRANSITION_STORAGE_KEY = "regalo.transition";
export const LOGIN_TRANSITION_STORAGE_VALUE = "login-success";

export const loginUi = {
  introLines: [
    "No supe cómo hablarte",
    "Y todavía te extraño",
    "Hice esto para vos",
  ] as string[],
  usernamePrompt: "Usuario",
  passwordPrompt: "Clave",
  invalidMessage: "Datos no validos",
} as const;

export const plazaUi = {
  movementHint: "wasd para mover · e para interactuar",
} as const;

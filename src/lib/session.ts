export const SESSION_STORAGE_KEY = "regalo.session";

export type CharacterId = "naomi" | "guillermo";

export type Session = {
  username: string;
  displayName: string;
  characterId: CharacterId;
};

type UserRecord = Session & {
  password: string;
};

const USERS: UserRecord[] = [
  {
    username: "naomi",
    password: "luna",
    displayName: "Naomi",
    characterId: "naomi",
  },
  {
    username: "guillermo",
    password: "maia",
    displayName: "Guillermo",
    characterId: "guillermo",
  },
];

export function authenticateUser(username: string, password: string): Session | null {
  const normalizedUsername = username.trim().toLowerCase();
  const normalizedPassword = password.trim().toLowerCase();

  const matchedUser = USERS.find(
    (user) =>
      user.username === normalizedUsername && user.password === normalizedPassword,
  );

  if (!matchedUser) {
    return null;
  }

  return {
    username: matchedUser.username,
    displayName: matchedUser.displayName,
    characterId: matchedUser.characterId,
  };
}

export function persistSession(session: Session) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readSession(): Session | null {
  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<Session>;

    if (
      parsed.username &&
      parsed.displayName &&
      (parsed.characterId === "naomi" || parsed.characterId === "guillermo")
    ) {
      return {
        username: parsed.username,
        displayName: parsed.displayName,
        characterId: parsed.characterId,
      };
    }
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  return null;
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getFixedUsers() {
  return USERS.map(({ password, ...user }) => ({
    ...user,
    password,
  }));
}

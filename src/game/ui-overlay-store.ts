"use client";

export interface OverlayLabelState {
  id: string;
  text: string;
  x: number;
  y: number;
  visible: boolean;
  active: boolean;
}

export interface OverlayDialogueState {
  visible: boolean;
  title: string;
  body: string;
  hint: string;
}

export interface OverlayHudState {
  movementHint: string;
}

export interface GameOverlayState {
  labels: OverlayLabelState[];
  dialogue: OverlayDialogueState;
  hud: OverlayHudState;
  activeAudioLabel: { text: string; x: number; y: number; elapsed: number; duration: number } | null;
  discoAudioOpen: boolean;
  cineVideoOpen: boolean;
  endingBlackoutVisible: boolean;
}

const DEFAULT_STATE: GameOverlayState = {
  labels: [],
  dialogue: {
    visible: false,
    title: "",
    body: "",
    hint: "e / enter",
  },
  hud: {
    movementHint: "",
  },
  activeAudioLabel: null,
  discoAudioOpen: false,
  cineVideoOpen: false,
  endingBlackoutVisible: false,
};

let state: GameOverlayState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function updateState(next: Partial<GameOverlayState>) {
  state = {
    ...state,
    ...next,
    dialogue: next.dialogue ? { ...state.dialogue, ...next.dialogue } : state.dialogue,
    hud: next.hud ? { ...state.hud, ...next.hud } : state.hud,
  };

  emitChange();
}

export function subscribeToGameOverlay(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getGameOverlayState() {
  return state;
}

export function resetGameOverlayState() {
  state = DEFAULT_STATE;
  emitChange();
}

export function setOverlayLabels(labels: OverlayLabelState[]) {
  updateState({ labels });
}

export function setOverlayDialogue(dialogue: Partial<OverlayDialogueState>) {
  updateState({ dialogue: { ...state.dialogue, ...dialogue } });
}

export function setOverlayHud(hud: Partial<OverlayHudState>) {
  updateState({ hud: { ...state.hud, ...hud } });
}

export function setAudioLabel(label: { text: string; x: number; y: number; elapsed: number; duration: number } | null) {
  updateState({ activeAudioLabel: label });
}

export function setDiscoAudioOpen(open: boolean) {
  updateState({ discoAudioOpen: open });
}

export function setCineVideoOpen(open: boolean) {
  updateState({ cineVideoOpen: open });
}

export function setEndingBlackoutVisible(visible: boolean) {
  updateState({ endingBlackoutVisible: visible });
}

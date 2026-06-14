export type StoryStepId =
  | "castle-intro"
  | "castle-exit"
  | "plaza-castle-front"
  | "cinema-intro"
  | "cinema-exit"
  | "discoteca-intro"
  | "discoteca-exit"
  | "thoughts-intro"
  | "thoughts-exit"
  | "home-intro"
  | "home-exit"
  | "camp-approach"
  | "camp-choice"
  | "ending";

export type StoryInteriorId =
  | "castillo"
  | "cine"
  | "discoteca"
  | "casa-pensamientos"
  | "casa";

export type EndingChoice = "stay" | "leave";

export interface StoryDialogueBlock {
  id: string;
  speaker: "maia";
  lines: string[];
  autoStart?: boolean;
  repeatable?: boolean;
}

export interface NaomiStoryState {
  stepId: StoryStepId;
  visitedInteriors: string[];
  triggeredDialogues: string[];
  endingLocked: boolean;
  endingChoice?: EndingChoice;
}

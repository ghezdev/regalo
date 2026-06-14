import { describe, expect, it } from "vitest";
import { loginUi } from "../ui";

describe("login UI", () => {
  it("keeps the username prompt behind the full intro sequence", () => {
    expect(loginUi.introLines).toEqual([
      "No supe cómo hablarte",
      "Y todavía te extraño",
      "Hice esto para vos",
      "Usa auriculares, todo tiene sonido",
    ]);
  });
});

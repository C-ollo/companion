import { describe, expect, it } from "vitest";
import {
  currentLevel,
  daysPracticedThisWeek,
  earnedStamps,
  neededLessHelp,
  passportSkill,
  remainingForPlaceStamp,
} from "./rules";
import type { Log, SupportLevel } from "./types";

let counter = 0;
function log(
  level: SupportLevel,
  place = "First Place laundry room",
  day = ++counter,
): Log {
  return {
    id: `log-${counter}`,
    at: new Date(Date.UTC(2026, 9, day, 12)).toISOString(),
    text: "Did laundry",
    skillId: "laundry",
    level,
    place,
    source: "self",
    via: "text",
  };
}

describe("currentLevel", () => {
  it("starts at With help with no logs", () => {
    expect(currentLevel([])).toBe("with_help");
  });

  it("uses a single log's level", () => {
    expect(currentLevel([log("with_prompt", undefined, 1)])).toBe("with_prompt");
  });

  it("needs 2 of the last 3 logs to reach a level", () => {
    const logs = [
      log("with_help", undefined, 1),
      log("on_my_own", undefined, 2),
      log("with_prompt", undefined, 3),
    ];
    expect(currentLevel(logs)).toBe("with_prompt");
  });

  it("reaches On my own with 2 of the last 3 on my own", () => {
    const logs = [
      log("with_help", undefined, 1),
      log("on_my_own", undefined, 2),
      log("on_my_own", undefined, 3),
    ];
    expect(currentLevel(logs)).toBe("on_my_own");
  });

  it("ignores logs older than the last 3", () => {
    const logs = [
      log("on_my_own", undefined, 1),
      log("on_my_own", undefined, 2),
      log("with_help", undefined, 3),
      log("with_help", undefined, 4),
      log("on_my_own", undefined, 5),
    ];
    expect(currentLevel(logs)).toBe("with_help");
  });
});

describe("earnedStamps", () => {
  it("earns With a prompt and On my own stamps at 3 logs each", () => {
    const logs = [
      log("on_my_own", undefined, 1),
      log("on_my_own", undefined, 2),
      log("on_my_own", undefined, 3),
    ];
    const kinds = earnedStamps("laundry", logs).map((s) => s.kind);
    expect(kinds).toEqual(["with_prompt", "on_my_own"]);
  });

  it("earns a new-place stamp after 2 on my own logs somewhere new", () => {
    const logs = [
      log("on_my_own", "First Place laundry room", 1),
      log("on_my_own", "My apartment", 2),
      log("on_my_own", "My apartment", 3),
    ];
    const placeStamp = earnedStamps("laundry", logs).find(
      (s) => s.kind === "new_place",
    );
    expect(placeStamp?.place).toBe("My apartment");
  });

  it("never gives a new-place stamp for the home place", () => {
    const logs = [1, 2, 3, 4].map((d) => log("on_my_own", "Home", d));
    expect(
      earnedStamps("laundry", logs).some((s) => s.kind === "new_place"),
    ).toBe(false);
  });
});

describe("passportSkill", () => {
  it("tells the person how many more logs earn the next stamp", () => {
    const logs = [log("with_prompt", undefined, 1)];
    expect(passportSkill("laundry", logs).nextStamp).toEqual({
      kind: "with_prompt",
      level: "with_prompt",
      remaining: 2,
    });
  });

  it("tracks each place separately", () => {
    const logs = [
      log("on_my_own", "First Place laundry room", 1),
      log("on_my_own", "First Place laundry room", 2),
      log("with_prompt", "My apartment", 3),
    ];
    const places = passportSkill("laundry", logs).places;
    expect(places).toEqual([
      { place: "First Place laundry room", level: "on_my_own", onMyOwnCount: 2 },
      { place: "My apartment", level: "with_prompt", onMyOwnCount: 0 },
    ]);
    expect(remainingForPlaceStamp("laundry", "My apartment", logs)).toBe(2);
  });
});

describe("neededLessHelp", () => {
  it("is true when a log moves the level up", () => {
    const before = [log("with_help", undefined, 1), log("with_help", undefined, 2)];
    const after = [...before, log("with_prompt", undefined, 3)];
    expect(neededLessHelp(after.slice(0, 2), after[2]!)).toBe(false);
    const more = log("with_prompt", undefined, 4);
    expect(neededLessHelp(after, more)).toBe(true);
  });
});

describe("daysPracticedThisWeek", () => {
  it("counts distinct days in the current Monday-to-Sunday week", () => {
    const now = new Date(2026, 10, 4, 12); // Wed Nov 4, 2026
    const at = (d: number, h: number) => new Date(2026, 10, d, h).toISOString();
    const logs = [
      { ...log("with_help"), at: at(2, 9) }, // Mon
      { ...log("with_help"), at: at(2, 18) }, // Mon again
      { ...log("with_help"), at: at(4, 8) }, // Wed
      { ...log("with_help"), at: at(1, 10) }, // Sun of last week
    ];
    expect(daysPracticedThisWeek(logs, now)).toBe(2);
  });
});

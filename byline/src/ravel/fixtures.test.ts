import { describe, it, expect } from "vitest";
import { demoFiles, demoFeatures, demoAnswer } from "./fixtures";
describe("Prepared demo integrity", () => {
  it("every feature path and explanation citation exists in its prepared source", () => {
    for (const feature of demoFeatures) {
      for (const path of feature.paths)
        expect(demoFiles.some((f) => f.path === path)).toBe(true);
      const answer = demoAnswer(feature, feature.questions[0]);
      for (const claim of answer.claims)
        for (const citation of claim.citations) {
          const file = demoFiles.find((f) => f.path === citation.path);
          expect(file).toBeDefined();
          expect(citation.line).toBeGreaterThanOrEqual(1);
          expect(citation.end_line).toBeLessThanOrEqual(file!.lines);
          expect(citation.end_line).toBeGreaterThanOrEqual(citation.line);
        }
    }
  });
});

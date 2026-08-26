import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const analyzeInput = z.object({
  job: z.string().trim().min(1).max(100),
  question: z.string().trim().max(500).default(""),
  content: z.string().trim().min(100).max(3000),
});

export const analyzeCoverLetter = createServerFn({ method: "POST" })
  .inputValidator((data) => analyzeInput.parse(data))
  .handler(async ({ data }) => {
    const { runAnalysis } = await import("./analyze.server");
    return runAnalysis(data);
  });

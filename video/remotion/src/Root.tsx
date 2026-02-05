import "./index.css";
import { Composition } from "remotion";
import { YouTubeEngineering } from "./YouTubeEngineering";
import type { InputProps } from "./types";

const demoProps: InputProps = {
  audioSrc: "/narration.mp3",
  storyboard: {
    title: "Shipping an Agent: The Production Layer",
    segments: [
      {
        title: "Interface contract",
        narration:
          "Define inputs, outputs, invariants, and a safe failure model. Treat the agent like a service.",
        visual: {
          type: "artifact",
          heading: "contract.json (excerpt)",
          body: `{
  "inputs": "Ticket text + metadata",
  "outputs": "Action proposal (validated)",
  "invariants": ["No external writes without policy"],
  "failure": "defer + emit run artifact"
}`,
        },
      },
      {
        title: "Control layer",
        narration:
          "Wrap the model with deterministic orchestration: state, tool gating, and policy checks.",
        visual: {
          type: "diagram",
          nodes: [
            { id: "ui", label: "Workflow", x: 0.18, y: 0.45 },
            { id: "orc", label: "Orchestrator", x: 0.42, y: 0.45 },
            { id: "llm", label: "LLM", x: 0.65, y: 0.32 },
            { id: "tools", label: "Tool Layer", x: 0.65, y: 0.58 },
            { id: "audit", label: "Audit Log", x: 0.86, y: 0.45, kind: "artifact" },
          ],
          edges: [
            { from: "ui", to: "orc", label: "request" },
            { from: "orc", to: "llm", label: "plan" },
            { from: "orc", to: "tools", label: "execute" },
            { from: "orc", to: "audit", label: "trace" },
          ],
        },
      },
      {
        title: "Observability",
        narration:
          "Capture traces and run artifacts so incidents can be reconstructed and fixed.",
        visual: {
          type: "artifact",
          heading: "run-summary.txt",
          body: `trace_id=7f3a…
step=tool.call name=github.create_issue status=ok dur_ms=420
step=policy.check scope=repo_write decision=deny reason=missing-approval
result=deferred artifact=s3://…/runs/7f3a…/`,
        },
      },
    ],
  },
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YouTubeEngineering"
        component={YouTubeEngineering}
        durationInFrames={30 * 20}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={demoProps}
      />
    </>
  );
};

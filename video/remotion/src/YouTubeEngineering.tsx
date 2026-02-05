import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { DiagramEdge, DiagramNode, InputProps, Segment } from "./types";

const COLORS = {
  bg: "#0B0F14",
  panel: "#0F1720",
  border: "#1F2A37",
  text: "#E5E7EB",
  muted: "#93A4B8",
  cyan: "#22D3EE",
  amber: "#FBBF24",
  red: "#F87171",
  green: "#34D399",
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const Panel: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        padding: 32,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      {title ? (
        <div style={{ color: COLORS.muted, fontSize: 18, marginBottom: 16 }}>
          {title}
        </div>
      ) : null}
      {children}
    </div>
  );
};

const NodeBox: React.FC<{ node: DiagramNode; opacity: number }> = ({
  node,
  opacity,
}) => {
  const { width, height } = useVideoConfig();
  const x = node.x * width;
  const y = node.y * height;

  const accent =
    node.kind === "risk"
      ? COLORS.red
      : node.kind === "artifact"
        ? COLORS.amber
        : COLORS.cyan;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        width: 360,
        padding: "18px 20px",
        borderRadius: 14,
        background: "rgba(15, 23, 32, 0.95)",
        border: `1px solid ${COLORS.border}`,
        opacity,
        boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 0 4px rgba(34, 211, 238, 0.08)`,
          }}
        />
        <div
          style={{
            fontSize: 22,
            fontWeight: 650,
            color: COLORS.text,
            letterSpacing: 0.2,
          }}
        >
          {node.label}
        </div>
      </div>
    </div>
  );
};

const DiagramScene: React.FC<{
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  startFrame: number;
  durationInFrames: number;
}> = ({ nodes, edges, startFrame, durationInFrames }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;

  const appear = interpolate(local, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Keep it simple for v1: show nodes (fade+slide) first; edges later (as labels only).
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: appear,
        }}
      >
        {nodes.map((n, i) => {
          const t = Math.max(0, local - i * 6);
          const o = interpolate(t, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const slide = interpolate(t, [0, 12], [18, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={n.id}
              style={{
                transform: `translateY(${slide}px)`,
              }}
            >
              <NodeBox node={n} opacity={o} />
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: 80,
            bottom: 80,
            color: COLORS.muted,
            fontSize: 18,
            opacity: interpolate(local, [40, 60], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {edges.length > 0
            ? `Signals: ${edges
                .slice(0, 3)
                .map((e) => e.label || `${e.from}→${e.to}`)
                .join(" · ")}${edges.length > 3 ? " …" : ""}`
            : ""}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TitleScene: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = Math.min(1, frame / (0.6 * fps));
  const o = easeOut(t);
  const y = interpolate(o, [0, 1], [16, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 120,
      }}
    >
      <div style={{ transform: `translateY(${y}px)`, opacity: o }}>
        <div
          style={{
            color: COLORS.text,
            fontSize: 62,
            fontWeight: 750,
            letterSpacing: 0.2,
            lineHeight: 1.1,
            maxWidth: 1400,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 22,
              color: COLORS.muted,
              fontSize: 26,
              textAlign: "center",
              maxWidth: 1200,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 60,
          color: COLORS.muted,
          fontSize: 16,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          opacity: 0.9,
        }}
      >
        AI Agents for Production · Practical Playbook
      </div>
    </AbsoluteFill>
  );
};

const ArtifactScene: React.FC<{ heading: string; body: string }> = ({
  heading,
  body,
}) => {
  return (
    <AbsoluteFill style={{ padding: 90 }}>
      <Panel title={heading}>
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            color: COLORS.text,
            fontSize: 20,
            lineHeight: 1.45,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          {body}
        </pre>
      </Panel>
    </AbsoluteFill>
  );
};

const SegmentScene: React.FC<{
  segment: Segment;
  startFrame: number;
  durationInFrames: number;
}> = ({ segment, startFrame, durationInFrames }) => {
  if (segment.visual.type === "title") {
    return (
      <TitleScene title={segment.title} subtitle={segment.visual.subtitle} />
    );
  }

  if (segment.visual.type === "diagram") {
    return (
      <DiagramScene
        nodes={segment.visual.nodes}
        edges={segment.visual.edges}
        startFrame={startFrame}
        durationInFrames={durationInFrames}
      />
    );
  }

  return <ArtifactScene heading={segment.visual.heading} body={segment.visual.body} />;
};

export const YouTubeEngineering: React.FC<InputProps> = ({
  storyboard,
  audioSrc,
}) => {
  const { fps } = useVideoConfig();

  // v1 timing: fixed 6s per segment + 2s title card
  const titleFrames = Math.round(2.0 * fps);
  const segmentFrames = Math.round(6.0 * fps);

  const total = titleFrames + storyboard.segments.length * segmentFrames;

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {audioSrc ? <Audio src={staticFile(audioSrc)} /> : null}

      <Sequence from={0} durationInFrames={titleFrames}>
        <TitleScene title={storyboard.title} subtitle={"A systems view"} />
      </Sequence>

      {storyboard.segments.map((s, idx) => {
        const from = titleFrames + idx * segmentFrames;
        return (
          <Sequence key={idx} from={from} durationInFrames={segmentFrames}>
            <AbsoluteFill style={{ padding: 90 }}>
              <div
                style={{
                  position: "absolute",
                  left: 90,
                  top: 60,
                  color: COLORS.muted,
                  fontSize: 18,
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                }}
              >
                SEGMENT {idx + 1}/{storyboard.segments.length}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 90,
                  top: 90,
                  color: COLORS.text,
                  fontSize: 34,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                }}
              >
                {s.title}
              </div>

              <div style={{ position: "absolute", inset: 0 }}>
                <SegmentScene segment={s} startFrame={from} durationInFrames={segmentFrames} />
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}

      <div
        style={{
          position: "absolute",
          right: 80,
          bottom: 60,
          color: COLORS.muted,
          fontSize: 16,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          opacity: 0.85,
        }}
      >
        1920×1080 · 30fps
      </div>

      {/* Safety: avoids unused var warning */}
      <div style={{ display: "none" }}>{total}</div>
    </AbsoluteFill>
  );
};

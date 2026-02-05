export type DiagramNode = {
  id: string;
  label: string;
  kind?: "system" | "risk" | "artifact";
  x: number; // 0..1
  y: number; // 0..1
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
};

export type Segment = {
  title: string;
  narration: string;
  visual:
    | {
        type: "title";
        subtitle?: string;
      }
    | {
        type: "diagram";
        nodes: DiagramNode[];
        edges: DiagramEdge[];
      }
    | {
        type: "artifact";
        heading: string;
        body: string;
      };
};

export type Storyboard = {
  title: string;
  segments: Segment[];
};

export type InputProps = {
  storyboard: Storyboard;
  // Optional: path in /public for the narration audio, e.g. "/audio.mp3"
  audioSrc?: string;
};

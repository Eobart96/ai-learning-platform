import type { RefObject } from "react";

type LegacyWorkspaceProps = {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onLoad: () => void;
};

export function LegacyWorkspace({ iframeRef, onLoad }: LegacyWorkspaceProps) {
  return (
    <section className="workspace-frame" aria-label="Рабочая область учебной платформы">
      <iframe
        ref={iframeRef}
        className="learning-platform"
        src="/legacy/index.html?embedded=1"
        title="Учебная область AI Learning Platform"
        onLoad={onLoad}
      />
    </section>
  );
}

"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";
import { useStyleOverride } from "@/lib/edit-context";
import { cn } from "@/lib/utils";
import { ColorPopover } from "./color-popover";

export function EditableSection({
  sectionKey,
  as,
  className,
  id,
  style,
  children,
}: {
  sectionKey: string;
  as?: ElementType;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [override, setOverride] = useStyleOverride(`section:${sectionKey}`);
  const Tag = (as || "section") as ElementType;

  const mergedStyle: CSSProperties | undefined = override?.backgroundColor
    ? { ...style, backgroundColor: override.backgroundColor, backgroundImage: "none" }
    : style;

  return (
    <Tag
      id={id}
      className={cn(className, "relative group")}
      style={mergedStyle}
    >
      <ColorPopover
        className="top-3 left-3"
        fields={["backgroundColor"]}
        value={override}
        onChange={setOverride}
      />
      {children}
    </Tag>
  );
}

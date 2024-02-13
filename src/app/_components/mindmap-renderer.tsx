"use client";

import { ArrowLeftCircle } from "lucide-react";
import { Transformer } from "markmap-lib";
import { Toolbar } from "markmap-toolbar";
import { Markmap } from "markmap-view";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const transformer = new Transformer();

function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
  while (wrapper?.firstChild) wrapper.firstChild.remove();
  if (mm && wrapper) {
    const toolbar = new Toolbar();
    toolbar.attach(mm);
    // Register custom buttons
    toolbar.register({
      id: "alert",
      title: "Click to show an alert",
      content: "Alert",
      onClick: () => alert("You made it!"),
    });
    toolbar.setItems([...Toolbar.defaultItems, "alert"]);
    wrapper.append(toolbar.render());
  }
}

export default function MindmapRenderer(props: { markdown: string }) {
  const router = useRouter();

  const refSvg = useRef<SVGSVGElement>(null);
  // Ref for Markmap Element
  const refMm = useRef<Markmap>();
  // Ref for toolbar wrapper
  const refToolbar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const markmap = Markmap.create(refSvg.current!);
    refMm.current = markmap;
  }, []);

  useEffect(() => {
    // Update data for markmap once value is changed
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(props.markdown);
    mm.setData(root);
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    mm.fit();
  }, [props.markdown]);

  return (
    <div className="h-screen w-screen">
      <Link className="absolute top-10 left-10" href="/"><ArrowLeftCircle size={50} /></Link>
      <svg id="1" className="h-full w-full" ref={refSvg} />
      <div className="absolute bottom-1 right-1" ref={refToolbar}></div>
    </div>
  );
}

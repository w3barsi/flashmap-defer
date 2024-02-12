import { type ReactNode } from "react";

import { cn } from "~/lib/utils";

const MaxWidthWrapper = ({
  className,
  children,
  id,
}: {
  className?: string;
  children: ReactNode;
  id?: string;
}) => {
  return (
    <div id={id} className={cn("mx-auto w-full max-w-screen-xl", className)}>
      {children}
    </div>
  );
};

export default MaxWidthWrapper;

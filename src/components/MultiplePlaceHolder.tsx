import type { ReactNode } from "react";
import React from "react";

type MultiplePlaceHolderProps = {
  placeHolder: ReactNode;
  amount?: number;
};

export const MultiplePlaceHolder = ({
  placeHolder,
  amount = 21,
}: MultiplePlaceHolderProps) => {
  return (
    <>
      {Array.from({ length: amount }).map((_, id) => (
        <React.Fragment key={id}>{placeHolder}</React.Fragment>
      ))}
    </>
  );
};

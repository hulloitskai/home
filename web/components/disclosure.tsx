import React, { FC, ReactNode, useMemo } from "react";
import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";

export interface DisclosureTriggerProps {
  readonly open: UseDisclosureReturn["onOpen"];
  readonly isOpen: boolean;
}

export interface DialogProps {
  readonly renderTrigger: (props: DisclosureTriggerProps) => ReactNode;
  readonly children: (props: UseDisclosureReturn) => ReactNode;
}

export const Disclosure: FC<DialogProps> = ({
  children: renderDisclosure,
  renderTrigger,
}) => {
  const disclosureProps = useDisclosure();
  const { isOpen, onOpen: open } = disclosureProps;

  const disclosure = useMemo(
    () => renderDisclosure(disclosureProps),
    [renderDisclosure, disclosureProps],
  );
  const trigger = useMemo(
    () => renderTrigger({ open, isOpen }),
    [renderTrigger, open, isOpen],
  );

  return (
    <>
      {disclosure}
      {trigger}
    </>
  );
};

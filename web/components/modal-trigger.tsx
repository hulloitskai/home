import React, { FC, ReactNode } from "react";
import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";

export interface ModalTriggerChildrenProps {
  open: UseDisclosureReturn["onOpen"];
  isOpen: boolean;
}

export interface ModalTriggerProps {
  renderModal: (props: UseDisclosureReturn) => ReactNode;
  renderTrigger: (props: ModalTriggerChildrenProps) => ReactNode;
}

export const ModalTrigger: FC<ModalTriggerProps> = ({
  renderModal,
  renderTrigger,
}) => {
  const disclosure = useDisclosure();
  const { isOpen, onOpen: open } = disclosure;
  return (
    <>
      {renderTrigger({ open, isOpen })}
      {renderModal(disclosure)}
    </>
  );
};

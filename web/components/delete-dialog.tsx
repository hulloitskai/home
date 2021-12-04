import React, { FC, useRef } from "react";

import { Button, ButtonGroup } from "@chakra-ui/react";

import {
  AlertDialogProps,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

export interface DeleteDialogProps
  extends Omit<AlertDialogProps, "children" | "leastDestructiveRef"> {
  name?: string;
  onDelete?: () => void;
}

export const DeleteDialog: FC<DeleteDialogProps> = ({
  name,
  onClose,
  onDelete,
  ...otherProps
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <AlertDialog
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      {...otherProps}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {name ? `Delete ${name}` : `Confirm Delete`}
          </AlertDialogHeader>
          <AlertDialogBody>
            Are you sure? You can&apos;t undo this action afterwards.
          </AlertDialogBody>
          <AlertDialogFooter>
            <ButtonGroup>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (onDelete) {
                    onDelete();
                  }
                  onClose();
                }}
              >
                Delete
              </Button>
            </ButtonGroup>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

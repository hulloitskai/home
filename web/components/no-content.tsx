import React, { FC } from "react";

import { BoxProps, VStack, Center } from "@chakra-ui/react";
import { Text, Icon } from "@chakra-ui/react";
import { HiOutlineInbox } from "react-icons/hi";

export type NoContentProps = BoxProps;

export const NoContent: FC<NoContentProps> = ({ children, ...otherProps }) => (
  <Center borderWidth={1} borderRadius="md" p={4} minH={28} {...otherProps}>
    <VStack spacing={1} color="gray.500">
      <Icon as={HiOutlineInbox} fontSize="2xl" />
      {!!children && <Text fontSize="sm">{children}</Text>}
    </VStack>
  </Center>
);

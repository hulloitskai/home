import React, { FC } from "react";
import { Skeleton, SkeletonProps } from "@chakra-ui/react";

export const SkeletonBlock: FC<SkeletonProps> = props => (
  <Skeleton h={48} rounded="md" {...props} />
);

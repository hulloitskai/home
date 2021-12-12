import React, { FC } from "react";
import { isEmpty } from "lodash";
import { useUser } from "@auth0/nextjs-auth0";

import { HiPlusCircle } from "react-icons/hi";

import { BoxProps, VStack } from "@chakra-ui/react";
import { Heading, Icon } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";

import { Section } from "components/section";
import { SkeletonBlock } from "components/skeleton";
import { Disclosure } from "components/disclosure";
import { NoContent } from "components/no-content";

import { FormCard } from "components/form-card";
import { CreateFormDialog } from "components/create-form-dialog";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useAdminResearchSectionQuery } from "apollo/schema";

gql`
  query AdminResearchSection($skip: Int = 0) {
    forms(skip: $skip, includeArchived: true) {
      id
      ...FormCardForm
    }
  }
`;

export type AdminResearchSectionProps = BoxProps;

export const AdminResearchSection: FC<AdminResearchSectionProps> = ({
  ...otherProps
}) => {
  const { user } = useUser();

  const handleQueryError = useHandleQueryError("Failed to load forms");
  const { data, refetch } = useAdminResearchSectionQuery({
    skip: !user,
    onError: handleQueryError,
  });
  const { forms } = data ?? {};

  return (
    <Section align="stretch" {...otherProps}>
      <Heading>Research</Heading>
      {forms ? (
        <VStack align="stretch">
          {forms.map(form => {
            const { id } = form;
            return <FormCard key={id} form={form} />;
          })}
          {isEmpty(forms) && (
            <NoContent>You don&apos;t have any forms.</NoContent>
          )}
          <Disclosure
            renderTrigger={({ open }) => (
              <Button
                leftIcon={<Icon as={HiPlusCircle} fontSize="lg" />}
                colorScheme="black"
                onClick={open}
              >
                Create Form
              </Button>
            )}
          >
            {props => (
              <CreateFormDialog
                onCreate={() => {
                  refetch();
                }}
                {...props}
              />
            )}
          </Disclosure>
        </VStack>
      ) : (
        <SkeletonBlock />
      )}
    </Section>
  );
};

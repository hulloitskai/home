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
import { CreateFormModal } from "components/create-form-modal";

import { gql } from "@apollo/client";
import { useHandleQueryError } from "components/apollo";
import { useAdminResearchSectionQuery } from "apollo";

gql`
  query AdminResearchSection($skip: Int = 0) {
    forms(skip: $skip) {
      id
      ...FormCardForm
    }
  }
`;

gql`
  mutation DeleteForm($input: DeleteFormInput!) {
    payload: deleteForm(input: $input) {
      ok
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
              <CreateFormModal
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

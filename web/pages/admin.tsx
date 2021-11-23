import React from "react";
import { NextPage } from "next";

import { Layout } from "components/layout";
import { useAuthentication } from "components/auth0";

import { AdminResearchSection } from "components/admin-research-section";

// type AdminPageProps = {};

const AdminPage: NextPage = () => {
  useAuthentication();
  return (
    <Layout
      badge="Admin"
      badgeTooltip="With great power comes great responsibility."
      align="center"
    >
      <AdminResearchSection />
    </Layout>
  );
};

export default AdminPage;

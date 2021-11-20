import React, { useMemo } from "react";
import { NextPage } from "next";

import ErrorPage from "pages/_error";

const message = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi justo nisi, dignissim non viverra non, lobortis sed felis. Fusce euismod posuere lectus, id vestibulum enim interdum ut. Fusce in justo blandit, sollicitudin justo a, suscipit quam. Quisque in dolor varius, accumsan dui id, volutpat velit. Sed in magna sit amet diam maximus molestie. Maecenas rutrum lacus non dolor lacinia, ut porta orci vulputate. Mauris sed vehicula sem. Nunc mollis vitae tellus vel ultricies. Phasellus fermentum mattis lacus, in tristique mi vestibulum id. Nulla eget vestibulum erat. Nullam non sodales tellus, nec tristique mi. Donec hendrerit nec velit ut hendrerit. In hac habitasse platea dictumst. Duis lacinia massa eu ante tristique fringilla. Mauris quam tortor, semper id ligula id, posuere euismod diam. Etiam ornare scelerisque ante, ac tempor orci ullamcorper volutpat.`;

const TestErrorPage: NextPage = () => {
  const err = useMemo(() => new Error(message), []);
  return <ErrorPage statusCode={500} hasGetInitialPropsRun={false} err={err} />;
};

export default TestErrorPage;

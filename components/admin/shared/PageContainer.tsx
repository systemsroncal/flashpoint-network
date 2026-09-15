import type { ReactNode } from "react";

type Props = {
  description?: string;
  children: ReactNode;
  title?: string;
};

const PageContainer = ({ title, description, children }: Props) => (
  <div>
    {title ? <title>{title}</title> : null}
    {description ? <meta name="description" content={description} /> : null}
    {children}
  </div>
);

export default PageContainer;

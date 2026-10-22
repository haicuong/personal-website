import type { ReactNode } from "react";
import { SiteHeader, type ActiveNavSection } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

interface LayoutProps {
  activeSection?: ActiveNavSection;
  mainClassName?: string;
  children: ReactNode;
}

export function Layout({
  activeSection = "home",
  mainClassName,
  children,
}: LayoutProps) {
  return (
    <>
      <SiteHeader activeSection={activeSection} />
      <main className={mainClassName}>{children}</main>
      <SiteFooter />
    </>
  );
}

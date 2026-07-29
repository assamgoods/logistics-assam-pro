import EnterpriseSidebar from "./components/EnterpriseSidebar";

export default function SuperAdminLayout({ children }) {
  return (
    <EnterpriseSidebar>
      {children}
    </EnterpriseSidebar>
  );
}
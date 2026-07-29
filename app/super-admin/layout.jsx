import EnterpriseSidebar from "@/components/super-admin/EnterpriseSidebar";

export default function SuperAdminLayout({ children }) {
  return (
    <EnterpriseSidebar>
      {children}
    </EnterpriseSidebar>
  );
}
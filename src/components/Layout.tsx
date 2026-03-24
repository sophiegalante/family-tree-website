import NavigationHeader from "./NavigationHeader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;

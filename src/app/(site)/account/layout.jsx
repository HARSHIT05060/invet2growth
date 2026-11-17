import AccountShell from "@/components/account/AccountShell";

export const metadata = {
  title: { default: "My account", template: "%s | My account | invest2growth" },
  robots: { index: false },
};

export default function AccountLayout({ children }) {
  return <AccountShell>{children}</AccountShell>;
}

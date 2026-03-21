import ProfileClient from "./ProfileClient";

export default function ProfilePage({
  params,
}: {
  params: { address: string };
}) {
  // In Next.js 16 app router, this is a server component. We pass the
  // dynamic route param down to a client component that handles hooks.
  return <ProfileClient address={params.address} />;
}

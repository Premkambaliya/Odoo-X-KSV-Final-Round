export const metadata = {
  title: 'Profile | DriveFleet',
  description: 'Manage your profile settings.',
};

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Profile</h1>
      <div className="rounded-2xl border border-border bg-white p-8 text-center text-secondary">
        Your profile management will be available here.
      </div>
    </div>
  );
}

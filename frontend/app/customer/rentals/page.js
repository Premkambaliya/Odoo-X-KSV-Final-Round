export const metadata = {
  title: 'My Rentals | DriveFleet',
  description: 'View your active and past rentals.',
};

export default function RentalsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">My Rentals</h1>
      <div className="rounded-2xl border border-border bg-white p-8 text-center text-secondary">
        Your rental items will be displayed here.
      </div>
    </div>
  );
}

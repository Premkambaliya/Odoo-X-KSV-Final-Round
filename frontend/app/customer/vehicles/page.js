export const metadata = {
  title: 'Browse Cars | DriveFleet',
  description: 'Browse our available cars for rent.',
};

export default function VehiclesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-primary mb-6">Browse Cars</h1>
      <div className="rounded-2xl border border-border bg-white p-8 text-center text-secondary">
        Products available for rent will be shown here.
      </div>
    </div>
  );
}

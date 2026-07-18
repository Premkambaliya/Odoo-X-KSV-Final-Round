'use client';

import {
  Car,
  CarFront,
  Users,
  ClipboardList,
  IndianRupee,
  CreditCard,
  Shield,
  AlertTriangle,
  CircleParking,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';

export default function StatsGrid({ overview, paymentsSummary, depositCount, penaltyCount, loading }) {
  const v = overview?.vehicles || {};
  const r = overview?.rentals || {};
  const rev = overview?.revenue || {};

  const cards = [
    {
      title: 'Total Vehicles',
      value: v.total,
      description: 'Fleet size across all categories',
      icon: Car,
      tone: 'accent',
    },
    {
      title: 'Available Vehicles',
      value: v.available,
      description: 'Ready for new bookings',
      icon: CarFront,
      tone: 'success',
    },
    {
      title: 'Rented Vehicles',
      value: v.rented,
      description: 'Currently on active hire',
      icon: CircleParking,
      tone: 'warning',
    },
    {
      title: 'Customers',
      value: overview?.customers?.total,
      description: 'Registered customer accounts',
      icon: Users,
      tone: 'secondary',
    },
    {
      title: 'Rental Orders',
      value: r.total,
      description: `${r.active || 0} active · ${r.pending || 0} pending`,
      icon: ClipboardList,
      tone: 'accent',
    },
    {
      title: 'Revenue',
      value: rev.total,
      description: `Monthly ${formatHint(rev.monthly)}`,
      icon: IndianRupee,
      tone: 'success',
      format: 'currency',
    },
    {
      title: 'Payments',
      value: paymentsSummary?.totalPaid,
      description: `Pending ${formatHint(paymentsSummary?.pendingAmount)}`,
      icon: CreditCard,
      tone: 'accent',
      format: 'currency',
    },
    {
      title: 'Security Deposits',
      value: depositCount,
      description: `Refunded ${formatHint(paymentsSummary?.refundAmount)}`,
      icon: Shield,
      tone: 'secondary',
    },
    {
      title: 'Penalties',
      value: penaltyCount,
      description: 'Recorded penalty cases',
      icon: AlertTriangle,
      tone: 'danger',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          {...card}
          loading={loading}
          delay={index * 0.04}
        />
      ))}
    </div>
  );
}

function formatHint(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);
}

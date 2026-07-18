'use client';

import { useCallback, useEffect, useState } from 'react';
import dashboardService from '@/services/dashboardService';
import analyticsService from '@/services/analyticsService';
import rentalService from '@/services/rentalService';
import paymentService from '@/services/paymentService';
import penaltyService from '@/services/penaltyService';
import securityDepositService from '@/services/securityDepositService';
import reportsService from '@/services/reportsService';
import { getErrorMessage } from '@/lib/apiResponse';
import {
  aggregatePaymentMethods,
  binByDay,
  toNumber,
} from '@/lib/format';

const emptyOverview = {
  vehicles: { total: 0, available: 0, reserved: 0, rented: 0, maintenance: 0 },
  customers: { total: 0 },
  rentals: { total: 0, active: 0, completed: 0, cancelled: 0, pending: 0 },
  revenue: { total: 0, today: 0, monthly: 0 },
  payments: { pendingAmount: 0 },
};

async function safe(promise) {
  try {
    return await promise;
  } catch (error) {
    return { __error: error };
  }
}

export default function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const results = await Promise.all([
      safe(dashboardService.getOverview()),
      safe(dashboardService.getRevenue()),
      safe(dashboardService.getRentals()),
      safe(dashboardService.getVehicles()),
      safe(dashboardService.getPayments()),
      safe(analyticsService.getRevenueTrend()),
      safe(analyticsService.getRentalTrend()),
      safe(rentalService.getRentalOrders({ limit: 5, sortBy: 'createdAt', order: 'desc' })),
      safe(paymentService.getPayments({ limit: 8, sortBy: 'paidAt', order: 'desc' })),
      safe(paymentService.getPayments({ limit: 100 })),
      safe(penaltyService.getPenalties({ limit: 1 })),
      safe(securityDepositService.getDeposits({ limit: 1 })),
      safe(reportsService.getRentalReport({})),
    ]);

    const failed = results.find((r) => r?.__error);
    // Critical: overview must succeed; if it fails, surface error
    if (results[0]?.__error) {
      setError(getErrorMessage(results[0].__error, 'Failed to load dashboard'));
      setLoading(false);
      return;
    }

    const [
      overviewRes,
      revenueRes,
      rentalsTodayRes,
      vehiclesByCatRes,
      paymentsSummaryRes,
      revenueTrendRes,
      rentalTrendRes,
      recentRentalsRes,
      recentPaymentsRes,
      paymentMethodsRes,
      penaltiesRes,
      depositsRes,
      rentalReportRes,
    ] = results.map((r) => (r?.__error ? null : r));

    const overview = overviewRes?.data || emptyOverview;
    const paymentsSummary = paymentsSummaryRes?.data || {
      totalPaid: 0,
      pendingAmount: 0,
      refundAmount: 0,
    };

    const recentFromReport = Array.isArray(rentalReportRes?.data)
      ? rentalReportRes.data.slice(0, 5)
      : [];
    const recentFromOrders = recentRentalsRes?.data?.orders || [];
    const recentRentals = recentFromReport.length ? recentFromReport : recentFromOrders;

    const recentPayments = recentPaymentsRes?.data?.payments || [];
    const methodSource = paymentMethodsRes?.data?.payments || recentPayments;

    const revenueTrendRows = Array.isArray(revenueTrendRes?.data)
      ? revenueTrendRes.data
      : [];
    const rentalTrendRows = Array.isArray(rentalTrendRes?.data)
      ? rentalTrendRes.data
      : [];

    setData({
      overview,
      revenuePeriods: revenueRes?.data || {
        today: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
      },
      todayOps: rentalsTodayRes?.data || { todayPickups: 0, todayReturns: 0 },
      vehiclesByCategory: vehiclesByCatRes?.data?.byCategory || [],
      paymentsSummary,
      penaltyCount: toNumber(penaltiesRes?.data?.pagination?.total),
      depositCount: toNumber(depositsRes?.data?.pagination?.total),
      recentRentals,
      recentPayments,
      paymentMethods: aggregatePaymentMethods(methodSource),
      revenueTrend: binByDay(revenueTrendRows, {
        dateKey: 'paidAt',
        valueAccessor: (row) => row?._sum?.amount,
        days: 14,
      }),
      rentalTrend: binByDay(rentalTrendRows, {
        dateKey: 'createdAt',
        valueAccessor: (row) => row?._count?.id,
        days: 14,
      }),
      partialFailure: Boolean(failed && !results[0]?.__error),
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, data, reload: load };
}

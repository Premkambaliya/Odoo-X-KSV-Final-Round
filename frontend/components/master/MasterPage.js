'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';

export default function MasterPage({
  title,
  description,
  breadcrumbs = [],
  actions,
  backHref,
  children,
}) {
  return (
    <PageContainer>
      <Header
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        showSearch={false}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {backHref ? (
              <Link href={backHref}>
                <Button variant="outline" size="sm">
                  <ArrowLeft size={14} />
                  Back
                </Button>
              </Link>
            ) : null}
            {actions}
          </div>
        }
      />
      {children}
    </PageContainer>
  );
}

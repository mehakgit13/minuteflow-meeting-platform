import { Suspense } from "react";

import { DashboardClient } from "@/components/DashboardClient";

function DashboardFallback() {
  return (
    <div className="dashboard-page-loading" aria-live="polite">
      <section className="page-head">
        <div>
          <p className="eyebrow">WORKSPACE</p>
          <h1>Meeting library</h1>
          <p>Loading your meeting workspace…</p>
        </div>
      </section>

      <section className="dashboard-stats">
        {[1, 2, 3, 4].map((item) => (
          <div key={item}>
            <div className="skeleton-line short" />
            <div className="skeleton-line title" />
            <div className="skeleton-line medium" />
          </div>
        ))}
      </section>

      <div className="meeting-grid">
        {[1, 2, 3].map((item) => (
          <div
            className="meeting-card meeting-card-skeleton"
            key={item}
          >
            <div className="skeleton-line short" />
            <div className="skeleton-line title" />
            <div className="skeleton-line" />
            <div className="skeleton-line medium" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardClient />
    </Suspense>
  );
}
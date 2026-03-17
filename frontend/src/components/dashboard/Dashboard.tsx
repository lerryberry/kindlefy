import PageLayout from '../layouts/PageLayout';

export default function Dashboard() {
  return (
    <PageLayout title="Kindle News Delivery">
      <div>
        <p>
          This app manages your <strong>Delivery Targets</strong> (Kindle emails), <strong>Content</strong> (topics),
          and <strong>Delivery Plans</strong> (schedules).
        </p>
        <p>Next: build CRUD screens for those three resources.</p>
      </div>
    </PageLayout>
  );
}


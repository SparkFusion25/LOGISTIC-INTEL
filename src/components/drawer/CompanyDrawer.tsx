// src/app/company/[id]/page.tsx
import CompanyDrawer from '../../../components/drawer';

export default function CompanyPage({ params }: { params: { id: string } }) {
  const { id } = params; // company_id from the URL
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6">
        <CompanyDrawer companyId={id} plan="trial" />
      </div>
    </div>
  );
}

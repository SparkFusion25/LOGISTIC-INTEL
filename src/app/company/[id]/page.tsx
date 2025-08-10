import CompanyDrawer from '../../../components/CompanyDrawer';

type PageProps = { params: { id: string } };

export default function CompanyPage({ params }: PageProps) {
  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Use trial for now; Add to CRM flips to premium */}
      <CompanyDrawer companyId={params.id} plan="trial" />
    </div>
  );
}

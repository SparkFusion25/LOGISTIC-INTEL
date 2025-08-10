import CompanyDrawer from '../../../components/CompanyDrawer';

export default function CompanyPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <CompanyDrawer companyId={params.id} plan="trial" />
    </div>
  );
}

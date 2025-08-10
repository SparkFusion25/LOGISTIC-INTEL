import CompanyDrawer from '../../../components/CompanyDrawer';

type PageProps = {
  params: { id: string };
};

export default function CompanyPage({ params }: PageProps) {
  const { id } = params; // company id from the URL
  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Use trial for now; Add to CRM will flip to premium. Change to 'pro'/'enterprise' if you want premium by plan. */}
      <CompanyDrawer companyId={id} plan="trial" />
    </div>
  );
}


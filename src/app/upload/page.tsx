import XmlUploader from '@/components/XmlUploader';

export default function UploadPage() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>📦 Upload XML Shipment Data</h1>
      <p style={{ marginBottom: '20px' }}>
        Upload a `.xml` file containing air or ocean shipment records. Parsed records will be saved to Supabase.
      </p>
      <XmlUploader />
    </div>
  );
}

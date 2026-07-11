import { PaymentReceiptView } from '@/components/dashboard/PaymentReceiptView'
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader'

export const metadata = {
  title: 'Payment receipt | Dashboard | MyCVRoast',
  robots: { index: false, follow: false },
}

export default function PaymentReceiptPage({ params }: { params: { id: string } }) {
  return (
    <>
      <div className="print:hidden">
        <DashboardPageHeader title="Receipt" description="Your Pro plan payment receipt." />
      </div>
      <PaymentReceiptView paymentId={params.id} />
    </>
  )
}

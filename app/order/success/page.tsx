import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function OrderSuccessPage({ searchParams }: Props) {
  const orderIdParam = searchParams?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam || "";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <Card padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Order placed successfully
          </h2>

          <p className="text-gray-600 mb-4">
            Thank you for your order. We will confirm and process it shortly.
          </p>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order reference: <span className="font-semibold">{orderId}</span>
            </p>
          )}

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="primary" className="w-full">
                Continue shopping
              </Button>
            </Link>

            <Link href="/account" className="block">
              <Button variant="outline" className="w-full">
                View orders (login required)
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}


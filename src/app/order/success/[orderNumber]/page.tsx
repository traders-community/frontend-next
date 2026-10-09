import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { orderService } from "@/services/order.service";
import { constructMetadata } from "@/lib/seo/metadata";
import { OrderSuccessView } from "@/components/order/order-success-view";
import { Button } from "@/components/ui/button";

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export const revalidate = 0; // Fresh receipt load

export async function generateMetadata({
  params,
}: OrderSuccessPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return constructMetadata({
    title: `Order Confirmation #${orderNumber} | Trader's Community`,
    description: `Official subscription receipt and Telegram channel activation for Order #${orderNumber}.`,
    noIndex: true, // Keep customer transaction receipts private from crawlers
  });
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { orderNumber } = await params;

  let order = null;
  try {
    const res = await orderService.getPublicOrderReceipt(orderNumber);
    if (res.data?.success && res.data.receipt) {
      order = res.data.receipt;
    }
  } catch (error) {
    console.error("[ORDER RECEIPT PAGE ERROR]", error);
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-2xl font-bold">
          ?
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading">
          Order Receipt Not Found
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          We could not locate an order matching reference{" "}
          <strong className="text-foreground font-mono">{orderNumber}</strong>. If you recently completed a payment, please allow a few moments or contact support.
        </p>
        <div className="pt-2 flex gap-3">
          <Link href="/courses">
            <Button variant="primary" size="md">
              Return to Courses
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="md">
              Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <OrderSuccessView order={order} />;
}

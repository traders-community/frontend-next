import { redirect } from "next/navigation";

interface ProductsRedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductsRedirectPage({
  params,
}: ProductsRedirectPageProps) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Booking Confirmed | Racoonn',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold capitalize">Booking success Page</h1>
      <p className="mt-4 text-muted-foreground">This page is under construction.</p>
    </div>
  );
}


import TicketDetailsClient from './client';

export default function Page({ params }: { params: { ticketId: string } }) {
  return <TicketDetailsClient ticketId={params.ticketId} />;
}

import { useParams } from "react-router-dom";
import OrderDetailView from "@/components/orders/OrderDetailView";

export default function BuyerOrderDetail() {
  const { id } = useParams();
  return <OrderDetailView orderId={id} role="buyer" />;
}
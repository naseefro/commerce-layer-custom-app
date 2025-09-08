import {
  ResourceListItem,
  Section,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements";
import type { Order, Shipment } from "@commercelayer/sdk";
import type { SetNonNullable, SetRequired } from "type-fest";

interface Props {
  order: Order;
}

const OrderShipment = ({
  shipment,
}: {
  shipment: Shipment;
}): React.JSX.Element => {
  const { canAccess } = useTokenProvider();

  //TODO: replace  window.location?.origin with .ENV variable
  const navigateToShipment = canAccess("shipments")
    ? { href: window.location?.origin + "/shipments/list/" + shipment?.id }
    : {};

  return (
    <ResourceListItem
      key={shipment.id}
      resource={shipment}
      {...navigateToShipment}
    />
  );
};

function hasShipments(
  order: Order
): order is SetRequired<SetNonNullable<Order, "shipments">, "shipments"> {
  return (
    order.shipments != null &&
    order.shipments.length > 0 &&
    order.shipments.filter((shipment) =>
      ["draft", "cancelled"].includes(shipment.status)
    ).length === 0
  );
}

export const OrderShipments = withSkeletonTemplate<Props>(({ order }) => {
  const { t } = useTranslation();

  if (!hasShipments(order)) {
    return null;
  }

  return (
    <Section
      title={t("resources.shipments.name", {
        count: order.shipments.length,
      })}
    >
      {order?.shipments?.map((shipment) => (
        <OrderShipment key={shipment.id} shipment={shipment} />
      ))}
    </Section>
  );
});

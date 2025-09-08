import {
  ListDetailsItem,
  Section,
  useTokenProvider,
  useTranslation,
  withSkeletonTemplate,
} from "@commercelayer/app-elements";
import type { Shipment } from "@commercelayer/sdk";

interface Props {
  shipment: Shipment;
}

export const ShipmentInfo = withSkeletonTemplate<Props>(
  ({ shipment }): React.JSX.Element => {
    const { canAccess } = useTokenProvider();
    const { t } = useTranslation();

    const shipmentOrderNumber = `#${shipment.order?.number}`;
    const shipmentCustomerEmail = shipment?.order?.customer?.email;
    //TODO: replace  window.location?.origin with .ENV variable
    const navigateToOrder = canAccess("orders")
      ? { href: window.location?.origin + "/orders/list/" + shipment.order?.id }
      : {};
    //TODO: replace  window.location?.origin with .ENV variable
    const navigateToCustomer = canAccess("customers")
      ? {
          href:
            window.location?.origin +
            "/customers/list/" +
            shipment.order?.customer?.id,
        }
      : {};

    return (
      <Section title="Info">
        <ListDetailsItem
          label={t("apps.shipments.details.origin")}
          gutter="none"
        >
          {shipment.stock_location?.name}
        </ListDetailsItem>
        <ListDetailsItem label={t("resources.orders.name")} gutter="none">
          {canAccess("orders") ? (
            <a {...navigateToOrder}>{`${shipmentOrderNumber}`}</a>
          ) : (
            `${shipmentOrderNumber}`
          )}
        </ListDetailsItem>
        <ListDetailsItem label={t("resources.customers.name")} gutter="none">
          {canAccess("customers") ? (
            <a {...navigateToCustomer}>{shipmentCustomerEmail}</a>
          ) : (
            shipmentCustomerEmail
          )}
        </ListDetailsItem>
      </Section>
    );
  }
);

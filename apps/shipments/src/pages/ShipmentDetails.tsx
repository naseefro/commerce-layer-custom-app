import { ShipmentAddresses } from "#components/ShipmentAddresses";
import { ShipmentInfo } from "#components/ShipmentInfo";
import { ShipmentPackingList } from "#components/ShipmentPackingList";
import { ShipmentSteps } from "#components/ShipmentSteps";
import { ShipmentTimeline } from "#components/ShipmentTimeline";
import { appRoutes } from "#data/routes";
import { useShipmentDetails } from "#hooks/useShipmentDetails";
import { useShipmentToolbar } from "#hooks/useShipmentToolbar";
import {
  Alert,
  Button,
  EmptyState,
  Grid,
  Icon,
  PageLayout,
  ResourceAttachments,
  ResourceDetails,
  ResourceMetadata,
  ResourceTags,
  SkeletonTemplate,
  Spacer,
  Text,
  formatDateWithPredicate,
  isMockedId,
  useAppLinking,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements";
import html2pdf from "html2pdf.js";
import isEmpty from "lodash-es/isEmpty";
import React, { useState } from "react";
import ReactDOMServer from "react-dom/server";
import { useRoute } from "wouter";
import { formatDate } from "../utils/date";

function ShipmentDetails(): React.JSX.Element {
  const {
    canUser,
    settings: { mode },
    user,
  } = useTokenProvider();
  const [, params] = useRoute<{ shipmentId: string }>(appRoutes.details.path);
  const { goBack } = useAppLinking();
  const { t } = useTranslation();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const shipmentId = params?.shipmentId ?? "";

  const { shipment, isLoading, error, mutateShipment, purchaseError } =
    useShipmentDetails(shipmentId);
  const pageToolbar = useShipmentToolbar({ shipment });

  // Shared function to generate pick sheet HTML
  const generatePickSheetHTML = () => {
    if (!shipment) return null;
    const aa = (
      <div
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          padding: 40,
          background: "white",
          color: "#000",
          lineHeight: 1.4,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          Pick Sheet # {shipment.order?.number}
        </h1>

        {/* Info Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            marginBottom: 30,
          }}
        >
          <div key="shipping_address" style={{ fontSize: "12px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Shipping Address
            </h2>
            <p>
              <strong>{shipment?.shipping_address?.name}</strong>
            </p>
            <p>{shipment?.shipping_address?.line_1}</p>
            <p>
              {shipment?.shipping_address?.city},{" "}
              {shipment?.shipping_address?.country_code}
            </p>
            <p style={{ marginTop: 10 }}>{shipment?.shipping_address?.email}</p>
            <p>{shipment?.shipping_address?.phone}</p>
          </div>
          <div key="billing_address" style={{ fontSize: "12px" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Billing Address
            </h2>
            <p>
              <strong>{shipment?.order?.billing_address?.name}</strong>
            </p>
            <p>{shipment?.order?.billing_address?.line_1}</p>
            <p>
              {shipment?.order?.billing_address?.city},{" "}
              {shipment?.order?.billing_address?.country_code}
            </p>
            <p style={{ marginTop: 10 }}>
              {shipment?.order?.billing_address?.email}
            </p>
            <p>{shipment?.order?.billing_address?.phone}</p>
          </div>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        {/* Order Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 30,
            marginTop: 30,
            marginBottom: 30,
            fontSize: 12,
          }}
        >
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Order Date & Time
            </h3>
            <p>{formatDate(shipment?.order?.placed_at)}</p>
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Amount to be collected
            </h3>
            <p>
              <strong>{shipment?.order?.total_amount_float}</strong>
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Payment Method
            </h3>
            <p>{shipment?.order?.payment_method?.name}</p>
          </div>
        </div>

        {/* Delivery Note */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Delivery Note
          </h3>
          <p>{shipment?.order?.metadata?.delivery_notes}</p>
        </div>
        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: 10,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                  width: 50,
                }}
              >
                #
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                  width: 100,
                }}
              >
                Image
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                  width: 120,
                }}
              >
                Code
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Sku
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                  width: 100,
                }}
              >
                Gift Pack
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: 12,
                  borderTop: "2px solid #000000ff",
                  borderBottom: "2px solid #000000ff",
                  fontSize: 14,
                  fontWeight: 600,
                  width: 60,
                }}
              >
                Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {shipment?.stock_line_items?.map((item, index) => (
              <tr key={item.id}>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                  }}
                >
                  {index + 1}
                </td>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#999",
                      textAlign: "center",
                      padding: 4,
                    }}
                  >
                    <img
                      src={
                        item.image_url
                          ? item.image_url
                          : "https://via.placeholder.com/80x80?text=No+Image"
                      }
                      alt={item.name ?? "no_image"}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                </td>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                  }}
                >
                  {item.sku?.reference ?? ""}
                </td>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                  }}
                >
                  {item.sku_code}
                </td>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                  }}
                >
                  {item.name}
                </td>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                  }}
                >
                  {item.metadata?.gift_pack ? "Yes" : "No"}
                </td>
                <td
                  style={{
                    padding: "16px 12px",
                    borderBottom: "1px solid #eee",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ marginTop: 20, paddingTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 12px",
              fontSize: 12,
            }}
          >
            <span>Subtotal</span>
            <span>
              {shipment?.order?.subtotal_amount_float
                ? `${shipment.order.currency_code} ${shipment.order.subtotal_amount_float}`
                : ""}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 12px",
              fontSize: 12,
            }}
          >
            <span>Delivery</span>
            <span>
              {shipment?.order?.shipping_amount_float
                ? `${shipment.order.currency_code} ${shipment.order.shipping_amount_float}`
                : "Free"}
            </span>
          </div>
          {shipment.order?.discount_amount_float ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 12px",
                fontSize: 12,
              }}
            >
              <span>Discounts</span>
              <span>{`-${shipment.order.currency_code} ${Math.abs(
                shipment.order?.discount_amount_float
              )}`}</span>
            </div>
          ) : (
            ""
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "15px 12px 8px",
              fontSize: 14,
              borderTop: "1px solid #ccc",
              borderBottom: "1px solid #ccc",
              marginTop: 10,
            }}
          >
            <span>
              <span style={{ fontWeight: 600 }}>Total</span>&nbsp;(Tax Included)
            </span>
            <span style={{ fontWeight: 600 }}>
              {shipment.order
                ? `${shipment.order.currency_code} ${shipment.order.total_amount_float}`
                : ""}
            </span>
          </div>
        </div>
      </div>
    );

    const html = ReactDOMServer.renderToString(aa);
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pick Sheet - Order #123456</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            padding: 20px;
            background: white;
            color: #000;
            line-height: 1.4;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 30px;
            text-align: center;
        }
        
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        
        th {
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #ddd;
            font-size: 14px;
            font-weight: 600;
        }
        
        td {
            padding: 16px 12px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
            vertical-align: middle;
        }
        
        @media print {
            body {
                padding: 20px;
            }
            
            .container {
                max-width: 100%;
            }
        }
    </style>
</head>
<body><div class="container">${html}</div>
</body>
</html>
    `;
  };

  const handleDownloadPickSheet = async () => {
    if (!shipment || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    setActionError(null);

    try {
      const html = generatePickSheetHTML(); // ✅ include styles
      if (!html) throw new Error("Failed to generate pick sheet HTML");

      const opt = {
        margin: 0.5,
        filename: `pick_sheet_${shipment.order?.number ?? "unknown"}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(html).save(); // ✅ keep styles
      setActionError(null);
    } catch (error) {
      console.error("Failed to generate pick sheet:", error);
      setActionError("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintPickSheet = () => {
    if (!shipment || isPrinting) return;

    setIsPrinting(true);
    setActionError(null);

    try {
      const html = generatePickSheetHTML();
      if (!html) throw new Error("Failed to generate pick sheet HTML");

      const printWindow = window.open("", "_blank", "width=900,height=700");

      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();

        // Ensure images are loaded before printing
        const images = printWindow.document.getElementsByTagName("img");
        let loadedImages = 0;
        const totalImages = images.length;

        const checkImagesAndPrint = () => {
          if (loadedImages === totalImages || totalImages === 0) {
            setTimeout(() => {
              printWindow.print();
              setIsPrinting(false);
              setActionError(null);
            }, 500);
          }
        };

        if (totalImages === 0) {
          checkImagesAndPrint();
        } else {
          Array.from(images).forEach((img) => {
            if (img.complete) {
              loadedImages++;
              checkImagesAndPrint();
            } else {
              img.onload = () => {
                loadedImages++;
                checkImagesAndPrint();
              };
              img.onerror = () => {
                loadedImages++;
                checkImagesAndPrint();
              };
            }
          });
        }
      } else {
        throw new Error(
          "Print window was blocked. Please allow popups for this site."
        );
      }
    } catch (error) {
      console.error("Failed to print pick sheet:", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to print. Please try again."
      );
      setIsPrinting(false);
    }
  };

  if (shipmentId === undefined || !canUser("read", "orders") || error != null) {
    return (
      <PageLayout
        title={t("resources.shipments.name_other")}
        navigationButton={{
          onClick: () => {
            goBack({
              defaultRelativePath: appRoutes.home.makePath({}),
            });
          },
          label: t("common.back"),
          icon: "arrowLeft",
        }}
        mode={mode}
      >
        <EmptyState
          title={t("common.not_authorized")}
          description={t("common.not_authorized_description")}
          action={
            <Button
              variant="primary"
              onClick={() => {
                goBack({
                  defaultRelativePath: appRoutes.home.makePath({}),
                });
              }}
            >
              {t("common.go_back")}
            </Button>
          }
        />
      </PageLayout>
    );
  }

  const pageTitle = `${t("resources.shipments.name")} #${shipment.number}`;

  return (
    <PageLayout
      mode={mode}
      toolbar={pageToolbar.props}
      title={
        <SkeletonTemplate isLoading={isLoading}>
          <div>{pageTitle}</div>
        </SkeletonTemplate>
      }
      description={
        <SkeletonTemplate isLoading={isLoading}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Grid alignItems="center" columns="auto">
              {formatDateWithPredicate({
                predicate: t("common.updated"),
                isoDate: shipment.updated_at,
                timezone: user?.timezone,
                locale: user?.locale,
                format: "full",
              })}
              <Button
                alignItems="center"
                size="mini"
                variant="secondary"
                disabled={isGeneratingPDF || !shipment.stock_line_items?.length}
                onClick={handleDownloadPickSheet}
              >
                <React.Fragment key=".1">
                  <Icon
                    name={isGeneratingPDF ? "arrowClockwise" : "download"}
                    size={16}
                  />
                  {isGeneratingPDF
                    ? "Generating PDF..."
                    : "Download Pick Sheet"}
                </React.Fragment>
              </Button>
              <Button
                alignItems="center"
                size="mini"
                variant="secondary"
                disabled={isPrinting || !shipment.stock_line_items?.length}
                onClick={handlePrintPickSheet}
              >
                <React.Fragment key=".1">
                  <Icon
                    name={isPrinting ? "arrowClockwise" : "printer"}
                    size={16}
                  />
                  {isPrinting ? "Preparing..." : "Print Pick Sheet"}
                </React.Fragment>
              </Button>
            </Grid>
            {actionError && <Alert status="error">{actionError}</Alert>}
            {!isEmpty(shipment.reference) && (
              <div>
                <Text variant="info">Ref. {shipment.reference}</Text>
              </div>
            )}
          </div>
        </SkeletonTemplate>
      }
      navigationButton={{
        onClick: () => {
          goBack({
            currentResourceId: shipmentId,
            defaultRelativePath: appRoutes.home.makePath({}),
          });
        },
        label: t("common.back"),
        icon: "arrowLeft",
      }}
      gap="only-top"
    >
      <SkeletonTemplate isLoading={isLoading}>
        <pageToolbar.Components />
        <Spacer bottom="4">
          <Spacer top="14">
            <ShipmentSteps shipment={shipment} />
          </Spacer>
          {purchaseError != null && (
            <Spacer top="14">
              <Alert status="error">{purchaseError}</Alert>
            </Spacer>
          )}
          <Spacer top="14">
            <ShipmentPackingList shipment={shipment} />
          </Spacer>
          <Spacer top="14">
            <ShipmentAddresses shipment={shipment} />
          </Spacer>
          <Spacer top="14">
            <ShipmentInfo shipment={shipment} />
          </Spacer>
          <Spacer top="14">
            <ResourceDetails
              resource={shipment}
              onUpdated={async () => {
                void mutateShipment();
              }}
            />
          </Spacer>
          {!isMockedId(shipment.id) && (
            <>
              <Spacer top="14">
                <ResourceTags
                  resourceType="shipments"
                  resourceId={shipment.id}
                  overlay={{
                    title: pageTitle,
                  }}
                />
              </Spacer>
              <Spacer top="14">
                <ResourceMetadata
                  resourceType="shipments"
                  resourceId={shipment.id}
                  overlay={{
                    title: pageTitle,
                  }}
                />
              </Spacer>
            </>
          )}
          <Spacer top="14">
            <ResourceAttachments
              resourceType="shipments"
              resourceId={shipment.id}
            />
          </Spacer>
          <Spacer top="14">
            <ShipmentTimeline shipment={shipment} />
          </Spacer>
        </Spacer>
      </SkeletonTemplate>
    </PageLayout>
  );
}

export default ShipmentDetails;

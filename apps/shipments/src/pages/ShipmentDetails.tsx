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
import { useRoute } from "wouter";

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
  console.log(
    "shipment",
    shipment?.stock_line_items?.[0]?.sku?.metadata?.product_code
  );

  // Shared function to generate pick sheet HTML
  const generatePickSheetHTML = () => {
    if (!shipment) return null;

    const now = new Date().toLocaleString();
    const rows = (shipment.stock_line_items ?? [])
      .map(
        (item) => `
        <tr>
         <td>
            ${
              item.image_url
                ? `<img src="${item.image_url}" crossorigin="anonymous"/>`
                : "-"
            }
          </td>
          <td>${item.sku?.metadata?.product_code ?? ""}</td>
          <td>${item.sku_code}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
        </tr>`
      )
      .join("");

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; padding: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <div>
          <h1 style="margin:0; font-size:22px; color:#333;">📦 Pick Sheet</h1>
          <p style="margin:4px 0; font-size:14px; color:#666;">
            Order: <strong>${shipment.order?.number ?? "unknown"}</strong><br/>
            Shipment: <strong>${shipment.number}</strong><br/>
            Generated: ${now}
          </p>
        </div>
        <div>
          <!-- Optional: add company logo -->
          <img src="data:image/png;base64,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" style="height:40px;" />
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
          <tr style="background:#f0f0f0; text-align:left;">
            <th style="padding:10px; border:1px solid #ddd;">Image</th>
            <th style="padding:10px; border:1px solid #ddd;">Product Code</th>
            <th style="padding:10px; border:1px solid #ddd;">Sku Code</th>
            <th style="padding:10px; border:1px solid #ddd;">Name</th>
            <th style="padding:10px; border:1px solid #ddd; text-align:center;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <style>
      td { border:1px solid #ddd; padding:8px; vertical-align:middle; }
      td img { max-width:80px; max-height:80px; object-fit:contain; display:block; margin:auto; }
      tr:nth-child(even) { background:#fafafa; }
    </style>
  `;
    return html;
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

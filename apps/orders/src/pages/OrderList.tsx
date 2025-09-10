import { ListEmptyState } from "#components/ListEmptyState";
import { ListItemOrder } from "#components/ListItemOrder";
import { makeCartsInstructions, makeInstructions } from "#data/filters";
import { presets } from "#data/lists";
import { appRoutes } from "#data/routes";
import {
  PageLayout,
  Spacer,
  useResourceFilters,
  useTokenProvider,
  useTranslation,
} from "@commercelayer/app-elements";
import { type FC } from "react";
import { useCountryCodes } from "src/metricsApi/useCountryCodes";
import { useLocation } from "wouter";
import { navigate, useSearch } from "wouter/use-browser-location";

const OrderList: FC = () => {
  const {
    settings: { mode },
  } = useTokenProvider();
  const { t } = useTranslation();
  const { countryCodes } = useCountryCodes();
  const queryString = useSearch();
  const [, setLocation] = useLocation();

  const isPendingOrdersList =
    new URLSearchParams(queryString).get("viewTitle") ===
    presets.pending.viewTitle;

  const { SearchWithNav, FilteredList, viewTitle, hasActiveFilter } =
    useResourceFilters({
      instructions: isPendingOrdersList
        ? makeCartsInstructions()
        : makeInstructions({
            sortByAttribute: "placed_at",
            countryCodes,
          }),
    });

  const hideFiltersNav = !(
    viewTitle == null ||
    viewTitle === presets.history.viewTitle ||
    isPendingOrdersList
  );

  return (
    <PageLayout
      title={viewTitle ?? presets.history.viewTitle}
      mode={mode}
      gap="only-top"
      navigationButton={{
        onClick: () => {
          setLocation(appRoutes.home.makePath({}));
        },
        label: t("resources.orders.name_other"),
        icon: "arrowLeft",
      }}
    >
      <SearchWithNav
        queryString={queryString}
        onUpdate={(qs) => {
          navigate(`?${qs}`, {
            replace: true,
          });
        }}
        onFilterClick={(queryString) => {
          setLocation(appRoutes.filters.makePath({}, queryString));
        }}
        hideFiltersNav={hideFiltersNav}
        searchBarDebounceMs={1000}
      />

      <Spacer bottom="14">
        <FilteredList
          type="orders"
          ItemTemplate={ListItemOrder}
          metricsQuery={{
            search: {
              limit: 25,
              sort: "desc",
              sort_by: isPendingOrdersList
                ? "order.updated_at"
                : "order.placed_at",
              fields: ["order.*", "billing_address.*", "market.*"],
            },
          }}
          hideTitle={viewTitle === presets.pending.viewTitle}
          emptyState={
            <ListEmptyState
              scope={
                hasActiveFilter
                  ? "userFiltered"
                  : viewTitle !== presets.history.viewTitle
                  ? "presetView"
                  : "history"
              }
            />
          }
        />
      </Spacer>
    </PageLayout>
  );
};

export default OrderList;

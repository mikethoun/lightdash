import {
    DashboardFilterRule,
    DashboardFilters,
    Explore,
} from '@lightdash/common';
import { useCallback, useMemo } from 'react';
import { useDashboardContext } from '../../providers/DashboardProvider';

const useDashboardFiltersForExplore = (
    tileUuid: string,
    explore: Explore | undefined,
): DashboardFilters => {
    const { dashboardFilters, dashboardTemporaryFilters } =
        useDashboardContext();

    const tables = useMemo(
        () => (explore ? Object.keys(explore.tables) : []),
        [explore],
    );

    const overrideTileFilters = useCallback(
        (rules: DashboardFilterRule[]) =>
            rules
                .filter((f) => f.tileTargetOverride?.[tileUuid] ?? true)
                .map((filter) => {
                    const tileConfig = filter.tileTargetOverride?.[tileUuid];
                    if (!tileConfig) return filter;

                    return {
                        ...filter,
                        target: {
                            fieldId: tileConfig.fieldId,
                            tableName: tileConfig.tableName,
                        },
                    };
                })
                .filter((f) => tables.includes(f.target.tableName)),
        [tables, tileUuid],
    );

    return useMemo(() => {
        return {
            dimensions: overrideTileFilters([
                ...dashboardFilters.dimensions,
                ...dashboardTemporaryFilters.dimensions,
            ]),
            metrics: overrideTileFilters([
                ...dashboardFilters.metrics,
                ...dashboardTemporaryFilters.metrics,
            ]),
        };
    }, [dashboardFilters, dashboardTemporaryFilters, overrideTileFilters]);
};

export default useDashboardFiltersForExplore;

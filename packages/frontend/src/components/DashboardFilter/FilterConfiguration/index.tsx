import { Intent, Tab, Tabs } from '@blueprintjs/core';
import { Classes, Popover2Props } from '@blueprintjs/popover2';

import {
    applyDefaultTileConfigToFilterRule,
    AvailableFiltersForSavedQuery,
    byFieldExact,
    byType,
    byTypeAndName,
    createDashboardFilterRuleFromField,
    DashboardFilterRule,
    fieldId,
    FilterableField,
    FilterOperator,
    FilterRule,
    getFilterRuleWithDefaultValue,
} from '@lightdash/common';
import produce from 'immer';
import { FC, useCallback, useMemo, useState } from 'react';
import FieldLabel from '../../common/Filters/FieldLabel';
import SimpleButton from '../../common/SimpleButton';
import {
    ActionsWrapper,
    ApplyButton,
    ConfigureFilterWrapper,
} from './FilterConfiguration.styled';
import FilterSettings from './FilterSettings';
import TileFilterConfiguration from './TileFilterConfiguration';

export enum FilterTabs {
    SETTINGS = 'settings',
    TILES = 'tiles',
}

const DEFAULT_TAB = FilterTabs.SETTINGS;

export enum FilterActions {
    ADD = 'add',
    REMOVE = 'remove',
}

interface Props {
    field: FilterableField;
    tilesWithSavedQuery: Record<string, AvailableFiltersForSavedQuery>;
    filterRule?: DashboardFilterRule;
    popoverProps?: Popover2Props;
    selectedTabId?: string;
    onTabChange: (tabId: FilterTabs) => void;
    onSave: (value: DashboardFilterRule) => void;
    onBack?: () => void;
}

const FilterConfiguration: FC<Props> = ({
    selectedTabId = DEFAULT_TAB,
    onTabChange,
    field,
    tilesWithSavedQuery,
    filterRule,
    popoverProps,
    onSave,
    onBack,
}) => {
    const [internalFilterRule, setInternalFilterRule] =
        useState<DashboardFilterRule>(
            filterRule
                ? applyDefaultTileConfigToFilterRule(
                      filterRule,
                      field,
                      tilesWithSavedQuery,
                  )
                : createDashboardFilterRuleFromField(
                      field,
                      tilesWithSavedQuery,
                  ),
        );

    const handleChangeFilterRule = useCallback(
        (newFilterRule: DashboardFilterRule) => {
            setInternalFilterRule(newFilterRule);
        },
        [],
    );

    const handleChangeFilterOperator = useCallback(
        (operator: FilterRule['operator']) => {
            setInternalFilterRule((prevState) =>
                getFilterRuleWithDefaultValue(field, {
                    ...prevState,
                    operator: operator,
                }),
            );
        },
        [field],
    );

    const handleChangeTileConfiguration = useCallback(
        (
            action: FilterActions,
            tileUuid: string,
            filterUuid?: FilterableField,
        ) => {
            const savedQuery = tilesWithSavedQuery[tileUuid];

            setInternalFilterRule((prevState) =>
                produce(prevState, (draftState) => {
                    draftState.tileConfigs =
                        draftState.tileConfigs?.filter((tileConfig) => {
                            return tileConfig.tileUuid !== tileUuid;
                        }) || [];

                    if (action === FilterActions.ADD) {
                        const filterableField =
                            filterUuid ??
                            savedQuery.filters.find(byFieldExact(field)) ??
                            savedQuery.filters.find(byTypeAndName(field)) ??
                            savedQuery.filters.find(byType(field));

                        if (!filterableField) return draftState;

                        draftState.tileConfigs.push({
                            tileUuid,
                            fieldId: fieldId(filterableField),
                        });
                    }
                }),
            );
        },
        [field, tilesWithSavedQuery],
    );

    return (
        <ConfigureFilterWrapper>
            <FieldLabel item={field} />

            <Tabs
                selectedTabId={selectedTabId}
                onChange={onTabChange}
                renderActiveTabPanelOnly
            >
                <Tab
                    id="settings"
                    title="Settings"
                    panel={
                        <FilterSettings
                            field={field}
                            filterRule={internalFilterRule}
                            onChangeFilterOperator={handleChangeFilterOperator}
                            onChangeFilterRule={handleChangeFilterRule}
                            popoverProps={popoverProps}
                        />
                    }
                />

                <Tab
                    id="tiles"
                    title="Tiles"
                    panel={
                        <TileFilterConfiguration
                            field={field}
                            filterRule={internalFilterRule}
                            popoverProps={popoverProps}
                            tilesWithSavedQuery={tilesWithSavedQuery}
                            onChange={handleChangeTileConfiguration}
                        />
                    }
                />
            </Tabs>

            <ActionsWrapper>
                {onBack && (
                    <SimpleButton small onClick={onBack}>
                        Back
                    </SimpleButton>
                )}

                <ApplyButton
                    type="submit"
                    className={Classes.POPOVER2_DISMISS}
                    intent={Intent.PRIMARY}
                    text="Apply"
                    disabled={
                        ![
                            FilterOperator.NULL,
                            FilterOperator.NOT_NULL,
                        ].includes(internalFilterRule.operator) &&
                        (!internalFilterRule.values ||
                            internalFilterRule.values.length <= 0)
                    }
                    onClick={() => onSave(internalFilterRule)}
                />
            </ActionsWrapper>
        </ConfigureFilterWrapper>
    );
};

export default FilterConfiguration;

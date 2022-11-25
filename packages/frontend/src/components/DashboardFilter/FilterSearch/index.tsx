import { FormGroup } from '@blueprintjs/core';
import { Popover2Props } from '@blueprintjs/popover2';
import {
    DashboardFieldTarget,
    DashboardFilterRule,
    FilterableField,
    FilterOperator,
    isField,
    isFilterableField,
} from '@lightdash/common';
import { FC, useState } from 'react';
import { useDashboardTilesWithFilters } from '../../../hooks/dashboard/useDashboard';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import { useTracking } from '../../../providers/TrackingProvider';
import { EventName } from '../../../types/Events';
import FieldAutoComplete from '../../common/Filters/FieldAutoComplete';
import FilterConfiguration from '../FilterConfiguration';
import { FilterModalContainer } from './FilterSearch.styles';

type Props = {
    fields: FilterableField[];
    isEditMode: boolean;
    popoverProps?: Popover2Props;
    onClose: () => void;
    onSelectField: (field: FilterableField) => void;
};

const DEFAULT_TAB = 'settings';

const FilterSearch: FC<Props> = ({
    fields,
    isEditMode,
    onClose,
    onSelectField,
    popoverProps,
}) => {
    const { track } = useTracking();
    const { dashboardTiles } = useDashboardContext();
    const { data: tilesWithFilters, isLoading } =
        useDashboardTilesWithFilters(dashboardTiles);
    const { addDimensionDashboardFilter } = useDashboardContext();

    const [selectedField, setSelectedField] = useState<FilterableField>();
    const [selectedTabId, setSelectedTabId] = useState(DEFAULT_TAB);

    if (isLoading || !tilesWithFilters) {
        return null;
    }

    const handleChangeField = (field: FilterableField) => {
        if (isField(field) && isFilterableField(field)) {
            setSelectedField(field);
            onSelectField(field);
        }
    };

    const handleSave = (
        value: DashboardFilterRule<
            FilterOperator,
            DashboardFieldTarget,
            any,
            any
        >,
    ) => {
        track({
            name: EventName.ADD_FILTER_CLICKED,
            properties: {
                mode: isEditMode ? 'edit' : 'viewer',
            },
        });
        setSelectedField(undefined);
        addDimensionDashboardFilter(value, !isEditMode);
        setSelectedTabId(DEFAULT_TAB);
        onClose();
    };

    const handleBack = () => {
        setSelectedTabId(DEFAULT_TAB);
        setSelectedField(undefined);
    };

    return (
        <FilterModalContainer
            $wide={!!selectedField && selectedTabId === 'tiles'}
        >
            {!selectedField ? (
                <>
                    <FormGroup
                        // TODO: update styles.
                        label={<b>Select a dimension to filter</b>}
                        helperText="Filters set on individual charts will be overridden."
                    >
                        <FieldAutoComplete
                            fields={fields}
                            onChange={handleChangeField}
                            popoverProps={{
                                matchTargetWidth: true,
                                captureDismiss: !popoverProps?.isOpen,
                                canEscapeKeyClose: !popoverProps?.isOpen,
                                ...popoverProps,
                            }}
                        />
                    </FormGroup>
                </>
            ) : (
                <FilterConfiguration
                    selectedTabId={selectedTabId}
                    onTabChange={setSelectedTabId}
                    field={selectedField}
                    tilesWithFilters={tilesWithFilters}
                    popoverProps={{
                        captureDismiss: true,
                        canEscapeKeyClose: true,
                        ...popoverProps,
                    }}
                    onSave={handleSave}
                    onBack={handleBack}
                />
            )}
        </FilterModalContainer>
    );
};

export default FilterSearch;

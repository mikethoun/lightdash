import { Icon } from '@blueprintjs/core';
import { MenuItem2, Popover2Props } from '@blueprintjs/popover2';
import { ItemRenderer, Suggest2 } from '@blueprintjs/select';
import {
    Field,
    FilterableField,
    getItemColor,
    getItemIcon,
    getItemId,
    getItemLabel,
    isDimension,
    isField,
    isMetric,
    TableCalculation,
} from '@lightdash/common';
import { createGlobalStyle } from 'styled-components';
import { getItemIconName } from '../../Explorer/ExploreTree/TableTree/Tree/TreeSingleNode';

type Item = Field | TableCalculation | FilterableField;

const AutocompleteMaxHeight = createGlobalStyle`
  .autocomplete-max-height {
    max-height: 400px;
    overflow-y: auto;
  }
`;

const getFieldIcon = (field: Item) => {
    if (isField(field) && (isDimension(field) || isMetric(field))) {
        return getItemIconName(field.type);
    }
    return getItemIcon(field);
};

const renderItem: ItemRenderer<Item> = (item, { modifiers, handleClick }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem2
            active={modifiers.active}
            key={getItemId(item)}
            icon={<Icon icon={getFieldIcon(item)} color={getItemColor(item)} />}
            text={
                <span>
                    {isField(item) ? `${item.tableLabel} ` : ''}
                    <b>{isField(item) ? item.label : item.displayName}</b>
                </span>
            }
            onClick={handleClick}
            shouldDismissPopover={false}
        />
    );
};

type FieldAutoCompleteProps<T> = {
    id?: string;
    name?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    activeField?: T;
    placeholder?: string;
    fields: Array<T>;
    onChange: (value: T) => void;
    onClosed?: () => void;
    popoverProps?: Popover2Props;
};

const FieldAutoComplete = <T extends Item>({
    disabled,
    autoFocus,
    activeField,
    fields,
    id,
    name,
    onChange,
    onClosed,
    placeholder,
    popoverProps,
}: FieldAutoCompleteProps<T>) => (
    <>
        <AutocompleteMaxHeight />
        <Suggest2<T>
            fill
            className={disabled ? 'disabled-filter' : ''}
            disabled={disabled}
            inputProps={{
                id,
                name,
                autoFocus,
                placeholder: placeholder || 'Search field...',
                leftIcon: activeField && (
                    <Icon
                        icon={getFieldIcon(activeField)}
                        color={getItemColor(activeField)}
                    />
                ),
            }}
            items={fields}
            itemsEqual={(value, other) => {
                return getItemId(value) === getItemId(other);
            }}
            inputValueRenderer={(item: Item) => {
                if (!activeField) {
                    return '';
                }
                return getItemLabel(item);
            }}
            popoverProps={{
                minimal: true,
                onClosed,
                popoverClassName: 'autocomplete-max-height',
                captureDismiss: true,
                ...popoverProps,
            }}
            itemRenderer={renderItem}
            activeItem={activeField}
            selectedItem={activeField}
            noResults={<MenuItem2 disabled text="No results." />}
            onItemSelect={onChange}
            itemPredicate={(
                query: string,
                item: Item,
                index?: undefined | number,
                exactMatch?: undefined | false | true,
            ) => {
                const label = getItemLabel(item);
                if (exactMatch) {
                    return query.toLowerCase() === label.toLowerCase();
                }
                return label.toLowerCase().includes(query.toLowerCase());
            }}
        />
    </>
);

export default FieldAutoComplete;

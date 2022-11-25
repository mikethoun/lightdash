import { MenuItem2 } from '@blueprintjs/popover2';
import { ItemRenderer } from '@blueprintjs/select';
import { FilterItem, getItemId } from '@lightdash/common';
import FieldIcon from './FieldIcon';
import FieldLabel from './FieldLabel';

const renderFilterItem: ItemRenderer<FilterItem> = (
    item,
    { modifiers, handleClick, handleFocus },
) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem2
            key={getItemId(item)}
            roleStructure="listoption"
            shouldDismissPopover={false}
            active={modifiers.active}
            disabled={modifiers.disabled}
            icon={<FieldIcon item={item} />}
            text={<FieldLabel item={item} />}
            onClick={handleClick}
            onFocus={handleFocus}
        />
    );
};

export default renderFilterItem;
